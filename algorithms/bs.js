// Beam Search Algorithm for TSP

function runBeam(){
  if(!cities.length){alert("先に都市を生成するか City coordinates を入力してください");return;}
  const wInput = parseInt(document.getElementById("beamW").value);
  const W = Number.isFinite(wInput)&&wInput>=1 ? wInput : DEFAULTS.beamW;

  const topKInput = parseInt(document.getElementById("bsTopK").value);
  const TOP = Number.isFinite(topKInput) && topKInput>=1 ? Math.min(topKInput, W) : W; // default all W

  let beam=[{path:[0], cost:0}]; // start at 0
  const record=[];
  const names=[];

  for(let step=0;step<N;step++){
    const K = Math.min(TOP, beam.length);
    for(let r=0;r<K;r++){
      record.push(beam[r].path.slice());
      names.push(`step${String(step+1).padStart(4,"0")}top${String(r+1).padStart(4,"0")}`);
    }

    if(step===N-1) break;

    const candidates=[];
    beam.forEach(state=>{
      const used=new Set(state.path);
      const last=state.path[state.path.length-1];
      for(let v=0;v<N;v++){
        if(!used.has(v)){
          const newCost=state.cost + dist(cities[last], cities[v]);
          const newPath=state.path.concat(v);
          candidates.push({path:newPath, cost:newCost});
        }
      }
    });
    candidates.sort((a,b)=>a.cost-b.cost);
    beam=candidates.slice(0,W);
  }

  if(beam.length){
    record.push(beam[0].path.slice());
    names.push("final_BS");
  }

  writeSolutionsToTextarea(record, names);
  syncFromSolutionField(true);
}