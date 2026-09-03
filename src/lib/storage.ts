import { useEffect, useState } from 'react';
import { actions as mockActions, problems as mockProblems, type Axis, type Status } from '../data';

export type Problem = {
  id: string; title: string; line: string; axis: Axis; owner: string; status: Status;
  openedAt: string; due: string; impact: string; cause: string; next: string;
  updatedAt: string; top3: number | null; comments: string[];
};
export type ActionStatus = 'À faire'|'En cours'|'Bloqué'|'Terminé';
export type Action = {
  id: number; title: string; problem: string; line: string; owner: string;
  status: ActionStatus; progress: number; due: string; comments: string[]; updatedAt: string;
};

const dateOffset = (days:number) => new Date(Date.now()-days*86400000).toISOString();
export const initialProblems: Problem[] = mockProblems.map((p, i) => ({
  id:p.id,title:p.title,line:p.line,axis:p.axis,owner:p.owner,status:p.status,
  openedAt:dateOffset(p.age),due:`2026-09-${p.due.slice(0,2)}`,impact:p.impact,
  cause:'',next:p.next,updatedAt:dateOffset(p.lastUpdate),top3:i<3?i+1:null,comments:[]
}));
export const initialActions: Action[] = mockActions.map(a => ({...a,due:`2026-09-${a.due.slice(0,2)}`,comments:[],updatedAt:new Date().toISOString()}));

export function usePersistedState<T>(key:string, initial:T) {
  const [value,setValue]=useState<T>(()=>{
    try { const saved=localStorage.getItem(key); return saved?JSON.parse(saved) as T:initial; }
    catch { return initial; }
  });
  useEffect(()=>{localStorage.setItem(key,JSON.stringify(value))},[key,value]);
  return [value,setValue] as const;
}
export const ageInDays=(date:string)=>Math.max(0,Math.floor((Date.now()-new Date(date).getTime())/86400000));
export const isStagnant=(date:string)=>ageInDays(date)>=3;
