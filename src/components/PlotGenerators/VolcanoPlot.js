import React, { useEffect, useMemo, useState } from "react";
import Plot from "react-plotly.js";
import Papa from "papaparse";

function coerceNum(x) {
  const n = Number(x);
  return Number.isFinite(n) ? n : NaN;
}

const headerMap = {
  gene: ["gene", "name", "symbol", "Gene", "Name", "GeneID"],
  log2FC: ["log2FC","log2FoldChange","log2FoldChg","logFC","logFC_mouse"],
  pvalue: ["pvalue","p-value","p_val","P.Value","PValue","P.VALUE"],
  qvalue: ["padj", "FDR", "adj.P.Val", "adj_pval", "qvalue", "q-value"],
  baseMean: ["baseMean", "AveExpr", "aveEXP", "AveExp", "AveExpression"],
  tvalue: ["t", "t-value", "tstat", "t_stat", "stat"]
};

function findCol(obj, aliases) {
  for (const k of Object.keys(obj)) {
    if (aliases.includes(k)) return k;
  }
  const lower = Object.fromEntries(Object.entries(obj).map(([k, v]) => [k.toLowerCase(), v]));
  for (const a of aliases) {
    if (lower[a.toLowerCase()] !== undefined) {
      const real = Object.keys(obj).find(k => k.toLowerCase() === a.toLowerCase());
      return real;
    }
  }
  return null;
}

export default function VolcanoPlot() {
  const [rows, setRows] = useState([]);
  const [geneQuery, setGeneQuery] = useState("");
  const [pCut, setPCut] = useState(0.05);
  const [fcCut, setFcCut] = useState(1);
  const [topN, setTopN] = useState(5);

  useEffect(() => {
    Papa.parse(`${process.env.PUBLIC_URL}/data/TCGA_GBM_vs_Brain.csv`, {
      download: true,
      header: true,
      dynamicTyping: false,
      skipEmptyLines: true,
      complete: (res) => setRows(res.data),
      error: (err) => console.error("CSV parse error:", err)
    });
  }, []);

  const data = useMemo(() => {
    if (!rows.length) return [];

    const geneCol = findCol(rows[0], headerMap.gene);
    const fcCol   = findCol(rows[0], headerMap.log2FC);
    const pCol    = findCol(rows[0], headerMap.pvalue);
    const qCol    = findCol(rows[0], headerMap.qvalue);
    const baseCol = findCol(rows[0], headerMap.baseMean);
    const tCol    = findCol(rows[0], headerMap.tvalue);

    let arr = rows.map(r => {
      const gene = (r[geneCol] ?? "").toString().trim();
      const log2FC = coerceNum(r[fcCol]);
      const pvalue = coerceNum(r[pCol]);
      const qvalue = qCol ? coerceNum(r[qCol]) : undefined;
      const baseMean = baseCol ? coerceNum(r[baseCol]) : undefined;
      const tvalue = tCol ? coerceNum(r[tCol]) : undefined;
      return { gene, log2FC, pvalue, qvalue, baseMean, tvalue };
    });

    arr = arr.filter(d =>
      d.gene &&
      Number.isFinite(d.log2FC) &&
      Number.isFinite(d.pvalue)
    );

    // min_p <- .Machine$double.eps; plot_data$pvalue[plot_data$pvalue <= 0] <- min_p
    const min_p = Number.EPSILON;
    arr.forEach(d => {
      if (d.pvalue <= 0) {
        d.pvalue = min_p;
      }
    });

    arr.forEach(d => (d.negLog10P = -Math.log10(d.pvalue)));

    arr.forEach(d => {
      d.diff = "NO";
      if (d.pvalue < pCut && d.log2FC >  fcCut) d.diff = "UP";
      if (d.pvalue < pCut && d.log2FC < -fcCut) d.diff = "DOWN";
    });

    const sorted = [...arr].sort((a, b) => a.pvalue - b.pvalue);
    const topSet = new Set(sorted.slice(0, Math.max(0, topN)).map(d => d.gene));
    arr.forEach(d => (d.label = topSet.has(d.gene) ? d.gene : null));

    return arr;
  }, [rows, pCut, fcCut, topN]);

  const targetRows = useMemo(() => {
    if (!geneQuery || !data.length) return [];
    const q = geneQuery.trim().toUpperCase();
    return data.filter(d => d.gene.toUpperCase() === q);
  }, [geneQuery, data]);

  const traces = useMemo(() => {
    if (!data.length) return [];

    const by = (k) => data.filter(d => d.diff === k);
    const mk = (arr, color, name) => ({
      x: arr.map(d => d.log2FC),
      y: arr.map(d => d.negLog10P),
      text: arr.map(d => d.gene),
      mode: "markers",
      type: "scattergl",
      name,
      marker: { color, size: 5, opacity: 0.7 },
      hovertemplate: "<b>%{text}</b><br>log2FC=%{x:.2f}<br>-log10(p)=%{y:.2f}<extra></extra>"
    });

    const up = mk(by("UP"), "#e74c3c", "UP");
    const dn = mk(by("DOWN"), "#3498db", "DOWN");
    const no = mk(by("NO"), "#b0b0b0", "No Sig.");

    const targetTrace = targetRows.length ? {
      x: targetRows.map(d => d.log2FC),
      y: targetRows.map(d => d.negLog10P),
      text: targetRows.map(d => d.gene),
      mode: "markers",
      type: "scatter",
      name: "Target",
      marker: { size: 10, color: "#070302ff", line: { width: 2, color: "#fff" } },
      hovertemplate: "<b>%{text}</b><br>log2FC=%{x:.2f}<br>-log10(p)=%{y:.2f}<extra></extra>"
    } : null;

    return [up, dn, no, targetTrace].filter(Boolean);
  }, [data, targetRows]);

  const shapes = useMemo(() => ([
    { type: "line", x0: -fcCut, x1: -fcCut, y0: 0, y1: 1, xref: "x", yref: "paper", line: { dash: "dot", width: 1, color: "#333" } },
    { type: "line", x0:  fcCut, x1:  fcCut, y0: 0, y1: 1, xref: "x", yref: "paper", line: { dash: "dot", width: 1, color: "#333" } },
    { type: "line", x0: 0, x1: 1, y0: -Math.log10(pCut), y1: -Math.log10(pCut), xref: "paper", yref: "y", line: { dash: "dot", width: 1, color: "#333" } }
  ]), [fcCut, pCut]);

  const annotations = useMemo(() => {
    const labeled = data.filter(d => d.label);
    const targetGenes = targetRows.map(d => d.gene);
    
    const allLabeledGenes = [...new Set([...labeled.map(d => d.gene), ...targetGenes])];
    const allLabeled = data.filter(d => allLabeledGenes.includes(d.gene));
    
    return allLabeled.map((d, i) => {
      const directions = [
        { ax: 0, ay: -30 },
        { ax: 25, ay: -25 },
        { ax: 30, ay: 0 },
        { ax: 25, ay: 25 },
        { ax: 0, ay: 30 },
        { ax: -25, ay: 25 },
        { ax: -30, ay: 0 },
        { ax: -25, ay: -25 }
      ];
      
      const dirIndex = i % directions.length;
      const baseDir = directions[dirIndex];
      
      const randomOffset = 5;
      const offsetX = (Math.random() - 0.5) * randomOffset;
      const offsetY = (Math.random() - 0.5) * randomOffset;
      
      return {
        x: d.log2FC,
        y: d.negLog10P,
        text: d.gene,
        showarrow: true,
        arrowhead: 2,
        arrowsize: 1,
        arrowwidth: 1.5,
        arrowcolor: "#666",
        ax: baseDir.ax + offsetX,
        ay: baseDir.ay + offsetY,
        font: { size: 12, color: "#2c3e50", family: "Arial" },
        bgcolor: "rgba(255,255,255,0.9)",
        borderwidth: 1,
        borderpad: 2,
        standoff: 4
      };
    });
  }, [data, targetRows]);

  const infoCard = targetRows[0];

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: 16 }}>
      <h2 style={{ marginBottom: 12 }}>Volcano Plot Analysis</h2>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 12, alignItems: "end" }}>
        <div>
          <label>Search gene</label><br />
          <input
            placeholder="e.g., PARP11"
            value={geneQuery}
            onChange={e => setGeneQuery(e.target.value)}
            style={{ width: "100%" }}
          />
        </div>
        <div>
          <label>p-value threshold</label><br />
          <input type="number" step="0.0001" value={pCut} onChange={e => setPCut(Number(e.target.value) || 0.05)} />
        </div>
        <div>
          <label>|log2FC| threshold</label><br />
          <input type="number" step="0.1" value={fcCut} onChange={e => setFcCut(Number(e.target.value) || 1)} />
        </div>
        <div>
          <label>Top N labels</label><br />
          <input type="number" min="0" step="1" value={topN} onChange={e => setTopN(Math.max(0, Number(e.target.value) || 0))} />
        </div>
      </div>

      <div style={{ marginTop: 16, marginBottom: 16 }}>
        <h3>Selected Gene Details</h3>
        <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 14 }}>
          <thead>
            <tr style={{ backgroundColor: "#f5f5f5" }}>
              <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}>Gene</th>
              <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}>log2FC</th>
              <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}>p-value</th>
              <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}>-log10(p)</th>
              <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}>q-value</th>
              <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}>baseMean</th>
              <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}>t-value</th>
              <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}>Classification</th>
            </tr>
          </thead>
          <tbody>
            {infoCard ? (
              <tr>
                <td style={{ border: "1px solid #ddd", padding: "8px", fontWeight: "bold", textAlign: "center" }}>{infoCard.gene}</td>
                <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}>{infoCard.log2FC?.toFixed?.(3)}</td>
                <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}>{infoCard.pvalue?.toExponential?.(2)}</td>
                <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}>{infoCard.negLog10P?.toFixed?.(3)}</td>
                <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}>{Number.isFinite(infoCard.qvalue) ? infoCard.qvalue?.toExponential?.(2) : "-"}</td>
                <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}>{Number.isFinite(infoCard.baseMean) ? infoCard.baseMean?.toFixed?.(2) : "-"}</td>
                <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}>{Number.isFinite(infoCard.tvalue) ? infoCard.tvalue?.toFixed?.(3) : "-"}</td>
                <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}>{infoCard.diff}</td>
              </tr>
            ) : (
              <tr>
                <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center", color: "#999" }} colSpan="8">
                  {geneQuery.trim() ? "-" : "Enter a gene name to search"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        
        {geneQuery.trim() && !infoCard && (
          <div style={{ 
            marginTop: "8px", 
            padding: "8px", 
            backgroundColor: "#ffe6e6", 
            border: "1px solid #ffcccc", 
            borderRadius: "4px",
            color: "#e74c3c",
            fontWeight: "bold",
            textAlign: "center"
          }}>
            Gene "{geneQuery.trim()}" not found
          </div>
        )}
      </div>

      <div style={{ marginTop: 14, display: "flex", justifyContent: "center" }}>
        <Plot
          data={traces}
          layout={{
            title: "TCGA Glioma vs GTEx Brain Cortex",
            xaxis: { title: "log2 Fold Change", zeroline: false },
            yaxis: { title: "-log10(p-value)", rangemode: "tozero" },
            shapes,
            annotations,
            legend: { 
              orientation: "h", 
              x: 0.5, 
              y: -0.15, 
              xanchor: 'center' 
            },
            margin: { l: 50, r: 20, t: 40, b: 50 },
            width: 600,
            height: 450
          }}
          config={{
            responsive: true,
            displaylogo: false,
            modeBarButtonsToAdd: ["toImage"],
            toImageButtonOptions: { format: "svg", filename: "VolcanoPlot", height: 600, width: 800, scale: 1 }
          }}
          style={{ width: "600px", height: "450px" }}
        />
      </div>

      <div style={{ marginTop: 16, display: "flex", justifyContent: "center" }}>
        <div style={{ fontSize: 14, color: "#333", textAlign: "center" }}>
          <b>Summary:</b> &nbsp;
          Up: {data.filter(d => d.diff === "UP").length} &nbsp; | &nbsp;
          Down: {data.filter(d => d.diff === "DOWN").length} &nbsp; | &nbsp;
          Total: {data.length}
        </div>
      </div>
    </div>
  );
}