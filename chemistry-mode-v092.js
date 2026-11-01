import {supplyBranches, createSuppliesSource as createOriginalSupplies, exportSuppliesTemplate as exportOriginalSupplies, isManual as originalManual} from './supplies-v09.js';
import {chemistryProducts} from './chemistry-data-v092.js';
import {chemistryTemplateBase64} from './chemistry-template-v092.js';
export {supplyBranches};
export const chemistryBranches = supplyBranches.map(branch => ({id:branch.id,name:branch.name,products:chemistryProducts}));
export function isManual(source){return source?.mode==='chemistry'||originalManual(source)}
export function createSuppliesSource(branchId,mode='supplies'){
 if(mode!=='chemistry')return createOriginalSupplies(branchId);
 const base=createOriginalSupplies(branchId);
 return {...base,mode:'chemistry',fingerprint:`standalone-chemistry-v1:${branchId}`,
  fileName:`Химия — ${base.sheetName}`,
  products:chemistryProducts.map(product=>({...product,id:`${product.id}:${branchId}`,revisions:{supplies:0},loss:0,unaccountedLossMoney:0,unitPrice:null})),
  summary:{...base.summary,pizzeria:`Химия · ${base.sheetName}`}};
}
export function exportSuppliesTemplate(source,reviews,CFB){
 if(source.mode!=='chemistry')return exportOriginalSupplies(source,reviews,CFB);
 const branch=chemistryBranches.find(branch=>branch.id===source.branchId);
 if(!branch)throw new Error('Пиццерия не найдена');
 const zip=CFB.read(chemistryTemplateBase64,{type:'base64'});
 const path='/xl/worksheets/sheet1.xml';
 const entry=CFB.find(zip,path);
 if(!entry)throw new Error('Не удалось открыть бланк химии');
 let xml=new TextDecoder().decode(new Uint8Array(entry.content));
 const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
 xml=xml.replace('{{BRANCH}}',escape(branch.name)).replace('{{DATE}}',new Date().toLocaleDateString('ru-RU'));
 for(const product of chemistryProducts){
  const review=reviews[`${product.id}:${branch.id}`];
  if(!review)continue;
  if(!Number.isFinite(review.value)||review.value<0)throw new Error('Некорректное количество');
  const pattern=new RegExp(`<x:c\\b([^>]*\\br="${product.quantityCell}"[^>]*?)(?:\\s*/>|>[\\s\\S]*?</x:c>)`);
  if(!pattern.test(xml))throw new Error(`В бланке нет ячейки ${product.quantityCell}`);
  xml=xml.replace(pattern,(_match,attrs)=>`<x:c${attrs.replace(/\s+t="[^"]*"/g,'')} t="n"><x:v>${review.value}</x:v></x:c>`);
 }
 CFB.utils.cfb_add(zip,path,new TextEncoder().encode(xml));
 const now=new Date(),date=[now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('-');
 return {bytes:new Uint8Array(CFB.write(zip,{fileType:'zip',type:'array',compression:true})),fileName:`Химия_${branch.name}_${date}.xlsx`};
}
