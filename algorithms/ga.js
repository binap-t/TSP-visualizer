// Genetic Algorithm for TSP

// GA Helper functions
function keyOf(arr){ return arr.join(","); }

function randomTour(rng){
  const t=[...Array(N).keys()];
  for(let i=t.length-1;i>0;i--){const j=randInt(rng,0,i); [t[i],t[j]]=[t[j],t[i]];}
  return t;
}

function mutateSwap(order,rng){
  const i=randInt(rng,0,order.length-1), j=randInt(rng,0,order.length-1);
  [order[i],order[j]]=[order[j],order[i]];
}

function mutateReverse(order,rng){
  const a=randInt(rng,0,order.length-2), b=randInt(rng,a+1,order.length-1);
  for(let k=0;k<(b-a+1)/2;k++) [order[a+k],order[b-k]]=[order[b-k],order[a+k]];
}

function makeInitialUniquePopulation(popSize,rng){
  const pop=[]; const seen=new Set();
  let tries=0, limit=popSize*50;
  while(pop.length<popSize && tries<limit){
    let t=randomTour(rng);
    let k=keyOf(t);
    if(seen.has(k)){
      for(let attempt=0; attempt<5 && seen.has(k); attempt++){
        mutateSwap(t,rng);
        k=keyOf(t);
      }
    }
    if(!seen.has(k)){ pop.push(t); seen.add(k); }
    tries++;
  }
  while(pop.length<popSize){
    let base = pop[randInt(rng,0,pop.length-1)].slice();
    mutateSwap(base,rng); mutateReverse(base,rng);
    const k = keyOf(base);
    if(!seen.has(k)){ pop.push(base); seen.add(k); }
  }
  return pop;
}

function ensureUniqueChild(child, seen, rng){
  let cand = child.slice();
  let k = keyOf(cand);
  if(!seen.has(k)) return cand;
  for(let i=0;i<10;i++){
    cand = child.slice();
    if(i%2===0) mutateSwap(cand,rng); else mutateReverse(cand,rng);
    k = keyOf(cand);
    if(!seen.has(k)) return cand;
  }
  return null;
}

function fillRandomUniques(next, seen, targetSize, rng){
  while(next.length<targetSize){
    let t = randomTour(rng);
    let k = keyOf(t);
    if(seen.has(k)) continue;
    seen.add(k); next.push(t);
  }
}

function orderCrossover(p1,p2,rng){
  const n=p1.length;
  const child=new Array(n).fill(-1);
  const a=randInt(rng,0,n-2), b=randInt(rng,a+1,n-1);
  for(let i=a;i<=b;i++) child[i]=p1[i];
  let idx=(b+1)%n;
  for(let k=0;k<n;k++){
    const gene=p2[(b+1+k)%n];
    if(!child.includes(gene)){child[idx]=gene; idx=(idx+1)%n;}
  }
  return child;
}

// Main GA function
function runGA(){
  if(!cities.length){alert("先に都市を生成するか City coordinates を入力してください");return;}
  const rng=mulberry32(7654321);
  const popInput = parseInt(document.getElementById("gaPop").value);
  const genInput = parseInt(document.getElementById("gaGen").value);
  const popSize = Number.isFinite(popInput)&&popInput>=2 ? popInput : DEFAULTS.gaPop;
  const generations = Number.isFinite(genInput)&&genInput>=1 ? genInput : DEFAULTS.gaGen;
  const mutationProb=0.2;

  const thinInput = parseInt(document.getElementById("gaThin").value);
  const thin = Number.isFinite(thinInput) && thinInput>=1 ? thinInput : 1;
  const topKInput = parseInt(document.getElementById("gaTopK").value);
  const topK = Number.isFinite(topKInput) && topKInput>=1 ? Math.min(topKInput, popSize) : popSize; // default all

  let population = makeInitialUniquePopulation(popSize, rng);

  const record=[];
  const names=[];
  let globalBest=null, globalBestLen=Infinity;

  for(let gen=0;gen<generations;gen++){
    const scored=population.map(t=>({tour:t,len:pathLength(t,true)})).sort((a,b)=>a.len-b.len);

    if((gen+1) % thin === 0){
      const K = Math.min(topK, scored.length);
      for(let r=0;r<K;r++){
        record.push(scored[r].tour.slice());
        names.push(`gen${String(gen+1).padStart(4,"0")}top${String(r+1).padStart(4,"0")}`);
      }
    }

    if(scored[0].len < globalBestLen){ globalBest = scored[0].tour.slice(); globalBestLen = scored[0].len; }

    const next=[]; const seen=new Set();
    next.push(scored[0].tour.slice()); // elitism
    seen.add(keyOf(next[0]));

    const tournament=(k)=>{
      let best=null;
      for(let i=0;i<k;i++){
        const cand=scored[randInt(rng,0,scored.length-1)];
        if(best===null||cand.len<best.len) best=cand;
      }
      return best.tour;
    };

    let safety=0, limit=popSize*100;
    while(next.length<popSize && safety<limit){
      safety++;
      const p1=tournament(5), p2=tournament(5);
      let child=orderCrossover(p1,p2,rng);
      if(rng()<mutationProb) mutateSwap(child,rng);
      let uniq=ensureUniqueChild(child, seen, rng);
      if(uniq){
        seen.add(keyOf(uniq));
        next.push(uniq);
      }
    }
    if(next.length<popSize){
      fillRandomUniques(next, seen, popSize, rng);
    }
    population=next;
  }

  if(globalBest){ record.push(globalBest.slice()); names.push("final_GA"); }

  writeSolutionsToTextarea(record, names);
  syncFromSolutionField(true);
}