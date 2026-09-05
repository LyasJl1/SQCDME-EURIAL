import { useEffect, useRef, useState } from 'react';
import { actions as mockActions, problems as mockProblems, type Axis, type Status } from '../data';

export type Problem = {
  id: string; title: string; line: string; axis: Axis; owner: string; status: Status;
  openedAt: string; due: string; impact: string; cause: string; next: string;
  updatedAt: string; top3: number | null; comments: string[];
};
export type ActionStatus = 'À faire'|'En cours'|'Bloqué'|'Terminé';
export type Action = {
  id: string; title: string; problem: string; line: string; owner: string;
  status: ActionStatus; progress: number; due: string; comments: string[]; updatedAt: string;
};

const dateOffset = (days:number) => new Date(Date.now()-days*86400000).toISOString();
export const initialProblems: Problem[] = mockProblems.map((p, i) => ({
  id:p.id,title:p.title,line:p.line,axis:p.axis,owner:p.owner,status:p.status,
  openedAt:dateOffset(p.age),due:`2026-09-${p.due.slice(0,2)}`,impact:p.impact,
  cause:'',next:p.next,updatedAt:dateOffset(p.lastUpdate),top3:i<3?i+1:null,comments:[]
}));
export const initialActions: Action[] = mockActions.map(a => ({...a,id:`00000000-0000-4000-8000-${String(a.id).padStart(12,'0')}`,due:`2026-09-${a.due.slice(0,2)}`,comments:[],updatedAt:new Date().toISOString()}));

export function usePersistedState<T>(key:string, initial:T) {
  const [value,setValue]=useState<T>(()=>{
    try { const saved=localStorage.getItem(key); return saved?JSON.parse(saved) as T:initial; }
    catch { return initial; }
  });
  useEffect(()=>{localStorage.setItem(key,JSON.stringify(value))},[key,value]);
  return [value,setValue] as const;
}

/** Offline-first state: localStorage remains available if Supabase is not configured. */
export function useSyncedState<T extends unknown[]>(key:string, initial:T, remote:{load:()=>Promise<T>;save:(value:T)=>Promise<void>}|null) {
  const [value,setValue]=usePersistedState(key,initial);
  const [loading,setLoading]=useState(Boolean(remote));
  const [error,setError]=useState('');
  const hydrated=useRef(!remote);
  useEffect(()=>{
    if(!remote)return;
    let active=true;
    remote.load().then(data=>{if(active)setValue(data)})
      .catch(e=>active&&setError(e instanceof Error?e.message:'Synchronisation impossible'))
      .finally(()=>{if(active){hydrated.current=true;setLoading(false)}});
    return()=>{active=false};
  },[remote,setValue]);
  useEffect(()=>{
    if(!remote||!hydrated.current)return;
    const timer=setTimeout(()=>remote.save(value).then(()=>setError('')).catch(e=>setError(e instanceof Error?e.message:'Sauvegarde impossible')),350);
    return()=>clearTimeout(timer);
  },[remote,value]);
  return [value,setValue,{loading,error,online:Boolean(remote)}] as const;
}
export const ageInDays=(date:string)=>Math.max(0,Math.floor((Date.now()-new Date(date).getTime())/86400000));
export const isStagnant=(date:string)=>ageInDays(date)>=3;
