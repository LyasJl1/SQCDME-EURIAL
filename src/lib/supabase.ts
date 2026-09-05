import type { Action, Problem } from './storage';

const url=(import.meta.env.VITE_SUPABASE_URL as string|undefined)?.replace(/\/$/,'');
const key=import.meta.env.VITE_SUPABASE_ANON_KEY as string|undefined;
export const isSupabaseConfigured=Boolean(url&&key);

async function request<T>(path:string,init:RequestInit={}):Promise<T>{
  if(!url||!key)throw new Error('Supabase n’est pas configuré.');
  const response=await fetch(`${url}/rest/v1/${path}`,{...init,headers:{apikey:key,Authorization:`Bearer ${key}`,'Content-Type':'application/json',...init.headers}});
  if(!response.ok){const body=await response.json().catch(()=>null) as {message?:string}|null;throw new Error(body?.message||`Erreur Supabase (${response.status})`)}
  if(response.status===204)return undefined as T;
  return response.json() as Promise<T>;
}

const problemFromDb=(p:Record<string,unknown>):Problem=>({id:String(p.code),title:String(p.title),line:String(p.line),axis:p.axis as Problem['axis'],owner:String(p.owner),status:p.status as Problem['status'],openedAt:String(p.opened_at),due:String(p.due_date),impact:String(p.impact||''),cause:String(p.cause||''),next:String(p.next_action||''),updatedAt:String(p.updated_at),top3:p.top3_rank==null?null:Number(p.top3_rank),comments:Array.isArray(p.comments)?p.comments.map(String):[]});
const problemToDb=(p:Problem)=>({code:p.id,title:p.title,line:p.line,axis:p.axis,owner:p.owner,status:p.status,opened_at:p.openedAt,due_date:p.due,impact:p.impact,cause:p.cause,next_action:p.next,updated_at:p.updatedAt,top3_rank:p.top3,comments:p.comments});
const actionFromDb=(a:Record<string,unknown>):Action=>({id:String(a.id),title:String(a.title),problem:String(a.problem_code||''),line:String(a.line),owner:String(a.owner),status:a.status as Action['status'],progress:Number(a.progress),due:String(a.due_date),comments:Array.isArray(a.comments)?a.comments.map(String):[],updatedAt:String(a.updated_at)});
const actionToDb=(a:Action)=>({id:a.id,title:a.title,problem_code:a.problem||null,line:a.line,owner:a.owner,status:a.status,progress:a.progress,due_date:a.due,comments:a.comments,updated_at:a.updatedAt});

function collection<T extends {id:string}>(table:string,fromDb:(row:Record<string,unknown>)=>T,toDb:(row:T)=>Record<string,unknown>){
  const idColumn=table==='problems'?'code':'id';
  return {load:async()=>{const rows=await request<Record<string,unknown>[]>(`${table}?select=*&order=updated_at.desc`);return rows.map(fromDb)},save:async(values:T[])=>{if(table==='problems')await request('problems?top3_rank=not.is.null',{method:'PATCH',headers:{Prefer:'return=minimal'},body:JSON.stringify({top3_rank:null})});if(values.length)await request(table,{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify(values.map(toDb))});const existing=await request<Record<string,unknown>[]>(`${table}?select=${idColumn}`);const ids=new Set(values.map(v=>v.id));const removed=existing.map(x=>String(x[idColumn])).filter(id=>!ids.has(id));if(removed.length)await request(`${table}?${idColumn}=in.(${removed.map(encodeURIComponent).join(',')})`,{method:'DELETE'});}};
}
export const problemsRemote=isSupabaseConfigured?collection<Problem>('problems',problemFromDb,problemToDb):null;
export const actionsRemote=isSupabaseConfigured?collection<Action>('actions',actionFromDb,actionToDb):null;
