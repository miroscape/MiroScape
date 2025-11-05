import React, { useState, useEffect } from "react";

export default function TestPage() {
  const [geneTableData, setGeneTableData] = useState(null);
  const [geneQuery, setGeneQuery] = useState("PARP11");
  const [excelData, setExcelData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [allData, setAllData] = useState({
    tcga: null,
    deseq2: null,
    mouseSn: null,
    mousePseudobulk: null,
    mapping: null
  });
  const [error, setError] = useState(null);

  // Load all data files
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [tcga, deseq2, mouseSn, mousePseudobulk, mapping] = await Promise.all([
          fetch('/data/TCGA_GBM_vs_Brain.csv').then(r => r.text()),
          fetch('/data/deseq2_results_with_plain.csv').then(r => r.text()),
          fetch('/data/mouse_sn_DE.csv').then(r => r.text()),
          fetch('/data/mouse_pseudobulk_de_results.csv').then(r => r.text()),
          fetch('/data/human_mouse_presence_map.csv').then(r => r.text())
        ]);

        setAllData({
          tcga: parseCSV(tcga),
          deseq2: parseCSV(deseq2),
          mouseSn: parseCSV(mouseSn),
          mousePseudobulk: parseCSV(mousePseudobulk),
          mapping: parseCSV(mapping)
        });
      } catch (err) {
        setError('Failed to load data files: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // CSV parser
  const parseCSV = (csvText) => {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });
      data.push(row);
    }
    
    return { headers, data };
  };

  // Search gene data
  const searchGene = () => {
    if (!allData.mapping || !geneQuery.trim()) {
      setError('Please enter a gene name');
      return;
    }

    const query = geneQuery.trim().toUpperCase();
    
    // Find gene in mapping
    const mappingEntry = allData.mapping.data.find(
      row => row.HumanGene?.toUpperCase() === query || row.MouseGene?.toUpperCase() === query
    );

    if (!mappingEntry) {
      setError('Gene not found in all datasets');
      setGeneTableData(null);
      return;
    }

    const humanGene = mappingEntry.HumanGene;
    const mouseGene = mappingEntry.MouseGene;

    // Build results table - always show 4 rows
    const results = [];

    // TCGA/GTEx
    let tcgaData = { dataset: 'TCGA/GTEx', gene: '-', log2FC: '-', avgExp: '-', pValue: '-', qValue: '-' };
    if (mappingEntry.in_tcga === '1') {
      const tcgaRow = allData.tcga.data.find(
        row => row.name?.toUpperCase() === humanGene?.toUpperCase()
      );
      if (tcgaRow) {
        tcgaData = {
          dataset: 'TCGA/GTEx',
          gene: tcgaRow.name,
          log2FC: parseFloat(tcgaRow.log2FC).toFixed(3),
          avgExp: parseFloat(tcgaRow.aveEXP).toFixed(3),
          pValue: parseFloat(tcgaRow['p-value']).toExponential(3),
          qValue: parseFloat(tcgaRow['q-value']).toExponential(3)
        };
      }
    }
    results.push(tcgaData);

    // Human Bulk RNA (DESeq2)
    let deseq2Data = { dataset: 'Human Bulk RNA', gene: '-', log2FC: '-', avgExp: '-', pValue: '-', qValue: '-' };
    if (mappingEntry.in_deseq2 === '1') {
      const deseq2Row = allData.deseq2.data.find(
        row => row.gene?.toUpperCase() === humanGene?.toUpperCase()
      );
      if (deseq2Row) {
        deseq2Data = {
          dataset: 'Human Bulk RNA',
          gene: deseq2Row.gene,
          log2FC: parseFloat(deseq2Row.log2FoldChange).toFixed(3),
          avgExp: parseFloat(deseq2Row.baseMean).toFixed(3),
          pValue: parseFloat(deseq2Row.pvalue).toExponential(3),
          qValue: parseFloat(deseq2Row.padj).toExponential(3)
        };
      }
    }
    results.push(deseq2Data);

    // Mouse snRNA-Seq
    let mouseSnData = { dataset: 'Mouse snRNA-Seq', gene: '-', log2FC: '-', avgExp: '-', pValue: '-', qValue: '-' };
    if (mappingEntry.in_mouse_sn === '1') {
      const mouseSnRow = allData.mouseSn.data.find(
        row => row.Gene?.toUpperCase() === mouseGene?.toUpperCase()
      );
      if (mouseSnRow) {
        mouseSnData = {
          dataset: 'Mouse snRNA-Seq',
          gene: mouseSnRow.Gene,
          log2FC: parseFloat(mouseSnRow.log2FC).toFixed(3),
          avgExp: '-',
          pValue: parseFloat(mouseSnRow.p_value).toExponential(3),
          qValue: parseFloat(mouseSnRow.q_value).toExponential(3)
        };
      }
    }
    results.push(mouseSnData);

    // Mouse Pseudobulk
    let mousePseudoData = { dataset: 'Mouse Pseudobulk', gene: '-', log2FC: '-', avgExp: '-', pValue: '-', qValue: '-' };
    if (mappingEntry.in_mouse_pseudobulk === '1') {
      const mousePseudoRow = allData.mousePseudobulk.data.find(
        row => row.Gene?.toUpperCase() === mouseGene?.toUpperCase()
      );
      if (mousePseudoRow) {
        mousePseudoData = {
          dataset: 'Mouse Pseudobulk',
          gene: mousePseudoRow.Gene,
          log2FC: parseFloat(mousePseudoRow.logFC_mouse).toFixed(3),
          avgExp: parseFloat(mousePseudoRow.AveExpr).toFixed(3),
          pValue: parseFloat(mousePseudoRow.PValue).toExponential(3),
          qValue: parseFloat(mousePseudoRow.padj || mousePseudoRow.FDR).toExponential(3)
        };
      }
    }
    results.push(mousePseudoData);

    setGeneTableData(results);
    setError(null);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Cross-Species Comparison</h1>
      
      {/* Search Box */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          value={geneQuery}
          onChange={(e) => setGeneQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && searchGene()}
          placeholder="Enter gene name (e.g., PARP11 or Parp11)"
          style={{ 
            padding: '10px', 
            fontSize: '16px', 
            width: '300px',
            marginRight: '10px'
          }}
        />
        <button 
          onClick={searchGene} 
          disabled={loading}
          style={{ 
            padding: '10px 20px', 
            fontSize: '16px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Loading...' : 'Search'}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#ffebee', 
          color: '#c62828',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      {/* Results Table */}
      {geneTableData && (
        <div>
          <h2>Results</h2>
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5' }}>
                <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>Dataset</th>
                <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>Gene</th>
                <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'right' }}>Log2 FC</th>
                <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'right' }}>Avg Expression</th>
                <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'right' }}>P-value</th>
                <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'right' }}>Q-value</th>
              </tr>
            </thead>
            <tbody>
              {geneTableData.map((row, index) => (
                <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                  <td style={{ border: '1px solid #ddd', padding: '10px' }}>{row.dataset}</td>
                  <td style={{ border: '1px solid #ddd', padding: '10px', fontStyle: row.gene === '-' ? 'italic' : 'normal', color: row.gene === '-' ? '#999' : '#000' }}>{row.gene}</td>
                  <td style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'right', color: row.log2FC === '-' ? '#999' : '#000' }}>{row.log2FC}</td>
                  <td style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'right', color: row.avgExp === '-' ? '#999' : '#000' }}>{row.avgExp}</td>
                  <td style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'right', color: row.pValue === '-' ? '#999' : '#000' }}>{row.pValue}</td>
                  <td style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'right', color: row.qValue === '-' ? '#999' : '#000' }}>{row.qValue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}