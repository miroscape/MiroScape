import React, { useState, useEffect } from "react";
import * as XLSX from 'xlsx';
import Plot from 'react-plotly.js';

export default function TestPage() {
  const [geneTableData, setGeneTableData] = useState(null);
  const [geneQuery, setGeneQuery] = useState("MYH7");
  const [excelData, setExcelData] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadExcelFile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/data/Chandra-FA-imputed.xlsx');
      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      setExcelData(data);
    } catch (error) {
      console.error('Error loading Excel file:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExcelFile();
  }, []);

  // 处理基因数据的函数，等价于R的make_gene_table_one
  const makeGeneTableOne = (gene, digits = 3) => {
    if (!excelData || excelData.length === 0) return null;

    const headers = excelData[0];
    const dataRows = excelData.slice(1);

    // 找基因列
    let geneColIndex = headers.findIndex(h => 
      typeof h === 'string' && h.toLowerCase().includes('gene')
    );
    if (geneColIndex === -1) geneColIndex = 1; // 默认第二列

    // 找到对应基因的行
    const geneRow = dataRows.find(row => row[geneColIndex] === gene);
    if (!geneRow) {
      console.log(`Gene not found: ${gene}`);
      return null;
    }

    // 辅助函数：按正则表达式找列并获取值
    const getOne = (pattern) => {
      const regex = new RegExp(pattern, 'i');
      const colIndex = headers.findIndex(h => typeof h === 'string' && regex.test(h));
      if (colIndex === -1) return null;
      const value = parseFloat(geneRow[colIndex]);
      return isNaN(value) ? null : value;
    };

    // 提取各列数据
    const cm_fa_dmso = getOne("Cardiomyocyte\\s*FA.*DMSO");
    const cm_fa_mr3 = getOne("Cardiomyocyte\\s*FA.*MR3");
    const cm_iso_dmso = getOne("Cardiomyocyte\\s*Iso\\s*Ctrl.*DMSO|Cardiomyocyte\\s*IsoCtrl.*DMSO");
    const cm_iso_mr3 = getOne("Cardiomyocyte\\s*Iso\\s*Ctrl.*MR3|Cardiomyocyte\\s*IsoCtrl.*MR3");
    
    const sn_fa_dmso = getOne("Sensory\\s*Neuron\\s*FA.*DMSO");
    const sn_fa_mr3 = getOne("Sensory\\s*Neuron\\s*FA.*MR3");
    const sn_iso_dmso = getOne("Sensory\\s*Neuron\\s*Iso\\s*Ctrl.*DMSO|Sensory\\s*Neuron\\s*IsoCtrl.*DMSO");
    const sn_iso_mr3 = getOne("Sensory\\s*Neuron\\s*Iso\\s*Ctrl.*MR3|Sensory\\s*Neuron\\s*IsoCtrl.*MR3");
    
    const fib_fa = getOne("^Fibroblast\\s*FA");
    const fib_hc = getOne("^Fibroblast\\s*Healthy|^Fibroblast\\s*HC");

    // 格式化数值
    const formatValue = (val) => {
      if (val === null || val === undefined) return null;
      return Math.round(val * Math.pow(10, digits)) / Math.pow(10, digits);
    };

    return {
      gene: gene,
      data: [
        {
          treatment: "DMSO",
          mr3: "—",
          cardiomyocytes_fa: formatValue(cm_fa_dmso),
          cardiomyocytes_iso: formatValue(cm_iso_dmso),
          sensory_neurons_fa: formatValue(sn_fa_dmso),
          sensory_neurons_iso: formatValue(sn_iso_dmso),
          fibroblasts_fa: formatValue(fib_fa),
          fibroblasts_hc: formatValue(fib_hc)
        },
        {
          treatment: "MR3",
          mr3: "+",
          cardiomyocytes_fa: formatValue(cm_fa_mr3),
          cardiomyocytes_iso: formatValue(cm_iso_mr3),
          sensory_neurons_fa: formatValue(sn_fa_mr3),
          sensory_neurons_iso: formatValue(sn_iso_mr3),
          fibroblasts_fa: null, // MR3行为NA
          fibroblasts_hc: null  // MR3行为NA
        }
      ]
    };
  };

  // 生成热力图数据
  const generateHeatmapData = (geneData) => {
    if (!geneData) return null;

    // X轴：细胞类型
    const xLabels = [
      "Cardiomyocytes FA",
      "Cardiomyocytes Iso Ctrl", 
      "Sensory Neurons FA",
      "Sensory Neurons Iso Ctrl",
      "Fibroblasts FA",
      "Fibroblasts HC"
    ];

    const yLabels = ["MR3_+", "MR3_-"];

    // Z值矩阵 (2行6列)
    const zValues = [
      // MR3行
      [
        geneData.data[1].cardiomyocytes_fa,
        geneData.data[1].cardiomyocytes_iso,
        geneData.data[1].sensory_neurons_fa,
        geneData.data[1].sensory_neurons_iso,
        geneData.data[1].fibroblasts_fa,
        geneData.data[1].fibroblasts_hc
      ],
      // DMSO行
      [
        geneData.data[0].cardiomyocytes_fa,
        geneData.data[0].cardiomyocytes_iso,
        geneData.data[0].sensory_neurons_fa,
        geneData.data[0].sensory_neurons_iso,
        geneData.data[0].fibroblasts_fa,
        geneData.data[0].fibroblasts_hc
      ]
    ];

    return {
      x: xLabels,
      y: yLabels,
      z: zValues,
      type: 'heatmap',
      colorscale: [
        [0, '#f8f9fa'],      // 最小值：浅灰/白色
        [0.1, '#e3f2fd'],    // 接近0：浅蓝
        [0.5, '#2196f3'],    // 中等值：蓝色
        [1, '#0d47a1']       // 最大值：深蓝
      ],
      showscale: true,
      colorbar: {
        title: "Expression Level",
        titleside: "right",
        thickness: 25,        // 从15增加到25，让bar更宽
        len: 0.9,            // 从0.7增加到0.9，让bar更长
        x: 1.02,             // 调整bar的水平位置
        y: 0.5,              // 垂直居中
        xanchor: "left",     // 锚点在左侧
        yanchor: "middle"    // 垂直居中锚点
      },
      hoverongaps: false,
      hovertemplate: 
        "<b>%{y}</b><br>" +
        "<b>%{x}</b><br>" +
        "Expression: %{z}<br>" +
        "<extra></extra>"
    };
  };

  // 处理基因查询
  const handleGeneSearch = () => {
    const result = makeGeneTableOne(geneQuery);
    setGeneTableData(result);
  };

  const heatmapTrace = geneTableData ? generateHeatmapData(geneTableData) : null;

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: 20 }}>
      <h1>Search Your Protein in Our Data!</h1>
      
      {/* 基因查询输入 */}
      <div style={{ marginBottom: 20 }}>
        <label>Gene Name: </label>
        <input 
          value={geneQuery}
          onChange={(e) => setGeneQuery(e.target.value)}
          placeholder="Enter gene name (e.g., MYH7)"
          style={{ marginRight: 10, padding: 5, width: 200 }}
        />
        <button 
          onClick={handleGeneSearch}
          disabled={loading}
          style={{ padding: 5, backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: 3 }}
        >
          {loading ? 'Loading...' : 'Search Gene'}
        </button>
      </div>

      {/* 数据表格 */}
      {geneTableData && (
        <div>
          <h4>Protein Log2(LFQ Intensity) for {geneTableData.gene}</h4>
          
          {/* 数值表格 */}
          <div style={{ marginBottom: 30 }}>
            <h5>Data Table</h5>
            <table style={{ borderCollapse: "collapse", fontSize: 14, marginBottom: 20 }}>
              <thead>
                <tr style={{ backgroundColor: "#f5f5f5" }}>
                  <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}>MR3</th>
                  <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}>Cardiomyocytes FA</th>
                  <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}>Cardiomyocytes Iso Ctrl</th>
                  <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}>Sensory Neurons FA</th>
                  <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}>Sensory Neurons Iso Ctrl</th>
                  <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}>Fibroblasts FA</th>
                  <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}>Fibroblasts HC</th>
                </tr>
              </thead>
              <tbody>
                {geneTableData.data.map((row, index) => (
                  <tr key={index}>
                    <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center", fontWeight: "bold" }}>
                      {row.mr3}
                    </td>
                    <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}>
                      {row.cardiomyocytes_fa !== null ? row.cardiomyocytes_fa : '-'}
                    </td>
                    <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}>
                      {row.cardiomyocytes_iso !== null ? row.cardiomyocytes_iso : '-'}
                    </td>
                    <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}>
                      {row.sensory_neurons_fa !== null ? row.sensory_neurons_fa : '-'}
                    </td>
                    <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}>
                      {row.sensory_neurons_iso !== null ? row.sensory_neurons_iso : '-'}
                    </td>
                    <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}>
                      {row.fibroblasts_fa !== null ? row.fibroblasts_fa : '-'}
                    </td>
                    <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}>
                      {row.fibroblasts_hc !== null ? row.fibroblasts_hc : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Plotly热力图 */}
          <div style={{ marginTop: 30 }}>
            <h5>Heatmap Visualization</h5>
            <div style={{ display: "flex", justifyContent: "center" }}>
              {heatmapTrace && (
                <Plot
                  data={[heatmapTrace]}
                  layout={{
                    title: `Protein Expression Heatmap for ${geneTableData.gene}`,
                    xaxis: {
                      title: "Cell Types",
                      side: "bottom",
                      tickangle: -45
                    },
                    yaxis: {
                      title: "Treatment",
                      autorange: "reversed" // 让DMSO在下面
                    },
                    width: 900,
                    height: 250,
                    margin: { l: 80, r: 120, t: 60, b: 120 } // 右边距从120增加到150，为更宽的bar留空间
                  }}
                  config={{
                    displaylogo: false,
                    modeBarButtonsToRemove: [
                      'zoom2d', 'pan2d', 'select2d', 'lasso2d', 
                      'zoomIn2d', 'zoomOut2d', 'autoScale2d', 
                      'resetScale2d'
                    ],
                    toImageButtonOptions: {
                      format: 'svg',
                      filename: `${geneTableData.gene}_heatmap`,
                      height: 250,
                      width: 900,
                      scale: 1
                    }
                  }}
                  style={{ width: "900px", height: "250px" }}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {!geneTableData && !loading && (
        <p>Enter a gene name and click "Search Gene" to display expression data.</p>
      )}
    </div>
  );
}