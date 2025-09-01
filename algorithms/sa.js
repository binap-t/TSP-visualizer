// Simulated Annealing Algorithm for TSP

function runSA(){
  if(!cities.length){alert("先に都市を生成するか City coordinates を入力してください");return;}
  const stepsInput = parseInt(document.getElementById("saSteps").value);
  const steps = Number.isFinite(stepsInput)&&stepsInput>0 ? stepsInput : DEFAULTS.saSteps;

  const thinInput = parseInt(document.getElementById("saThin").value);
  const thin = Number.isFinite(thinInput) && thinInput>=1 ? thinInput : 1;

  let order=[...Array(N).keys()];
  let bestLen=pathLength(order,true);
  let bestOrder=order.slice();

  const T0 = DEFAULTS.T0, Tend = DEFAULTS.Tend;
  const rng=mulberry32(1234567);

  const record=[];
  const names=[];

  record.push(order.slice());
  names.push("initial");

  let currLen=bestLen, stepNo=0;

  for(let iter=1;iter<=steps;){
    const i=randInt(rng,0,N-1), j=randInt(rng,0,N-1);
    if(i===j) continue;
    const a=Math.min(i,j), b=Math.max(i,j);
    const aPrev=order[(a-1+N)%N], aCity=order[a], bCity=order[b], bNext=order[(b+1)%N];
    const delta =  dist(cities[aPrev],cities[bCity]) + dist(cities[aCity],cities[bNext])
                 - dist(cities[aPrev],cities[aCity]) - dist(cities[bCity],cities[bNext]);

    const T = T0 * Math.pow(Tend/T0, iter/steps);
    if(delta<0 || Math.exp(-delta/T) > rng()){
      for(let k=0;k<(b-a+1)/2;k++) [order[a+k],order[b-k]]=[order[b-k],order[a+k]];
      currLen += delta;
      if(currLen<bestLen){bestLen=currLen; bestOrder=order.slice();}
    }
    iter++;
    stepNo++;
    if(stepNo % thin === 0){
      record.push(order.slice());
      names.push(`step${String(stepNo).padStart(4,"0")}`);
    }
  }

  record.push(bestOrder.slice());
  names.push("final_SA");

  writeSolutionsToTextarea(record, names);
  syncFromSolutionField(true);
}