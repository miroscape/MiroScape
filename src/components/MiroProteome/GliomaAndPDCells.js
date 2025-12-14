import React, { useState, useEffect } from "react";
import * as XLSX from 'xlsx';
import Plot from 'react-plotly.js';
import {useLocation} from "react-router-dom";
import {Col, Row} from "antd";
import {Content} from "antd/es/layout/layout";

export default function GliomaAndPDCells() {
  const [geneTableData, setGeneTableData] = useState(null);
  const [geneQuery, setGeneQuery] = useState("");
  const [excelData, setExcelData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [shouldRenderOtherComponents, setShouldRenderOtherComponents] = useState(false);
  const location = useLocation();

  const loadExcelFile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.PUBLIC_URL}/data/Kwak-GBM-iDA-251208.xlsx`);
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
    setShouldRenderOtherComponents(location.pathname === '/miroProteome/gliomaAndPDCells')
  }, [location.pathname]);

  const makeGeneTableOne = (gene, digits = 3) => {
    if (!excelData || excelData.length === 0) return null;

    const headers = excelData[0];
    const dataRows = excelData.slice(1);

    // Find the gene column index
    const geneColIndex = headers.findIndex(h => 
      typeof h === 'string' && h.toLowerCase().includes('gene names_primary')
    );

    if (geneColIndex === -1) {
      console.log('Gene column not found');
      return null;
    }

    const geneRow = dataRows.find(row => row[geneColIndex] === gene);
    if (!geneRow) {
      console.log(`Gene not found: ${gene}`);
      return null;
    }

    const getColumnValue = (pattern) => {
      const regex = new RegExp(pattern, 'i');
      const colIndex = headers.findIndex(h => typeof h === 'string' && regex.test(h));
      if (colIndex === -1) return null;
      const value = parseFloat(geneRow[colIndex]);
      return isNaN(value) ? null : value;
    };

    const getColumnText = (pattern) => {
      const regex = new RegExp(pattern, 'i');
      const colIndex = headers.findIndex(h => typeof h === 'string' && regex.test(h));
      if (colIndex === -1) return null;
      return geneRow[colIndex] || null;
    };

    // Get protein information
    const proteinId = getColumnText("Majority protein IDs_primary");
    const subMitoLoc = getColumnText("Sub-Mitochondrial localization from Mitocarta3.0");
    const cellularLoc = getColumnText("cellular localization from native org. IP");
    const loclTl = getColumnText("LOCL-TL");

    // Get expression values
    const gbm_dmso = getColumnValue("GBM DMSO");
    const gbm_mr3 = getColumnValue("GBM MR3");
    const ipsc_dmso = getColumnValue("iPSC-DMSO");
    const a53t_ipsc = getColumnValue("A53T SNCA iPSC");
    const ida_dmso = getColumnValue("iDA-DMSO");
    const ida_mr3 = getColumnValue("iDA-MR3");
    const a53t_ida = getColumnValue("A53T SNCA iDA\\s*log2ASVG MS intensity");
    const a53t_ida_mr3 = getColumnValue("A53T SNCA iDA-MR3");

    const formatValue = (val) => {
      if (val === null || val === undefined) return null;
      return Math.round(val * Math.pow(10, digits)) / Math.pow(10, digits);
    };

    return {
      gene: gene,
      proteinInfo: {
        proteinId,
        subMitoLoc,
        cellularLoc,
        loclTl
      },
      data: [
        {
          treatment: "DMSO",
          mr3: "—",
          gbm: formatValue(gbm_dmso),
          ipsc: formatValue(ipsc_dmso),
          a53t_ipsc: formatValue(a53t_ipsc),
          ida: formatValue(ida_dmso),
          a53t_ida: formatValue(a53t_ida)
        },
        {
          treatment: "MR3",
          mr3: "+",
          gbm: formatValue(gbm_mr3),
          ipsc: null,
          a53t_ipsc: null,
          ida: formatValue(ida_mr3),
          a53t_ida: formatValue(a53t_ida_mr3)
        }
      ]
    };
  };

  const generateHeatmapData = (geneData) => {
    if (!geneData) return null;

    const xLabels = [
      "GBM",
      "iPSC", 
      "A53T SNCA iPSC",
      "iDA",
      "A53T SNCA iDA"
    ];

    const yLabels = ["MR3_+", "MR3_-"];

    const zValues = [
      [
        geneData.data[1].gbm,
        geneData.data[1].ipsc,
        geneData.data[1].a53t_ipsc,
        geneData.data[1].ida,
        geneData.data[1].a53t_ida
      ],
      [
        geneData.data[0].gbm,
        geneData.data[0].ipsc,
        geneData.data[0].a53t_ipsc,
        geneData.data[0].ida,
        geneData.data[0].a53t_ida
      ]
    ];

    const allValues = zValues.flat().filter(v => v !== null);
    const maxValue = Math.max(...allValues);

    return {
      x: xLabels,
      y: yLabels,
      z: zValues,
      type: 'heatmap',
      zmin: 0,
      zmax: maxValue,
      colorscale: [
        [0, '#f8f9fa'],
        [0.1, '#e3f2fd'],
        [0.5, '#2196f3'],
        [1, '#0d47a1']
      ],
      showscale: true,
      colorbar: {
        title: "Expression Level",
        titleside: "right",
        thickness: 25,
        len: 0.9,
        x: 1.02,
        y: 0.5,
        xanchor: "left",
        yanchor: "middle"
      },
      hoverongaps: false,
      hovertemplate: 
        "<b>%{y}</b><br>" +
        "<b>%{x}</b><br>" +
        "Expression: %{z}<br>" +
        "<extra></extra>"
    };
  };

  const handleGeneSearch = () => {
    const result = makeGeneTableOne(geneQuery);
    setGeneTableData(result);
  };

  const heatmapTrace = geneTableData ? generateHeatmapData(geneTableData) : null;

  return (
      <div>
        {shouldRenderOtherComponents && (
            <>
              <Row>
                <Col span={24}>
                  <Content style={{ fontWeight: 'bold', padding: '12px 24px', fontSize: '24px', fontFamily: 'Arial' }}>
                    Welcome to MiroProteome-Glioma and PD Cells!
                  </Content>
                  <Content style={{ padding: '0 24px', fontSize: '18px', fontFamily: 'Arial' }}>
                    This dataset contains proteomic data from glioma cells, and iDAs with and without SNCA-A53T, with and without MR3 treatment.
                  </Content>
                  <Content style={{ fontWeight: 'bold', padding: '12px 24px 6px 24px', fontSize: '18px', fontFamily: 'Arial' }}>
                    If using MiroProteome-Glioma and PD Cells or the data provided, please cite:
                  </Content>
                  <Content style={{ padding: '0 24px', fontSize: '18px', fontFamily: 'Arial' }}>
                    Kwak, C.S.; Du, Z.; Creery, J.S.; Zarbock, E.W.; Major, M.B.; Elias, J.E.; Wang, X. (2025).
                    Optogenetic Proximity Labeling Maps Spatially Resolved Mitochondrial Surface Proteomes and a Locally Regulated Ribosome Pool.
                  </Content>
                </Col>
              </Row>
              <div style={{ maxWidth: 1200, margin: "0", padding: "0px 20px 20px 20px" }}>
                <h2 style={{ fontSize: '22px' }}>Search Your Protein in Our Data!</h2>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: '16px' }}>Gene Name: </label>
                  <input
                    value={geneQuery}
                    onChange={(e) => setGeneQuery(e.target.value)}
                    placeholder="Enter gene name (e.g., HSPD1)"
                    style={{ marginRight: 10, padding: '8px', width: 250, fontSize: '16px' }}
                  />
                  <button
                    onClick={handleGeneSearch}
                    disabled={loading}
                    style={{ padding: '5px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: 3, fontSize: '16px' }}
                  >
                    {loading ? 'Loading...' : 'Search Gene'}
                  </button>
                </div>

                {geneTableData && (
                  <div>
                    <h4 style={{ fontSize: '18px', marginBottom: '15px' }}>Protein Information for {geneTableData.gene}</h4>
                    
                    <div style={{ marginBottom: 25, padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
                      <p style={{ fontSize: '16px', marginBottom: '8px' }}>
                        <strong>Protein ID:</strong> {geneTableData.proteinInfo.proteinId || 'N/A'}
                      </p>
                      <p style={{ fontSize: '16px', marginBottom: '8px' }}>
                        <strong>Sub-Mitochondrial localization (from Mitocarta3.0):</strong> {geneTableData.proteinInfo.subMitoLoc || 'N/A'}
                      </p>
                      <p style={{ fontSize: '16px', marginBottom: '8px' }}>
                        <strong>Cellular localization (from native org. IP):</strong> {geneTableData.proteinInfo.cellularLoc || 'N/A'}
                      </p>
                      <p style={{ fontSize: '16px', marginBottom: '0' }}>
                        <strong>LOCL-TL:</strong> {geneTableData.proteinInfo.loclTl || 'N/A'}
                      </p>
                    </div>

                    <h4 style={{ fontSize: '16px', marginBottom: '10px' }}>Protein Log2 Average MS Intensity for {geneTableData.gene}</h4>

                    <div style={{ marginBottom: 20 }}>
                      <h5 style={{ fontSize: '16px', marginBottom: '20px' }}>Data Table</h5>
                      <table style={{ borderCollapse: "collapse", fontSize: 16, marginBottom: 20 }}>
                        <thead>
                          <tr style={{ backgroundColor: "#f5f5f5" }}>
                            <th style={{ border: "1px solid #ddd", padding: "10px", textAlign: "center", fontSize: '16px' }}>MR3</th>
                            <th style={{ border: "1px solid #ddd", padding: "10px", textAlign: "center", fontSize: '16px' }}>GBM</th>
                            <th style={{ border: "1px solid #ddd", padding: "10px", textAlign: "center", fontSize: '16px' }}>iPSC</th>
                            <th style={{ border: "1px solid #ddd", padding: "10px", textAlign: "center", fontSize: '16px' }}>A53T SNCA iPSC</th>
                            <th style={{ border: "1px solid #ddd", padding: "10px", textAlign: "center", fontSize: '16px' }}>iDA</th>
                            <th style={{ border: "1px solid #ddd", padding: "10px", textAlign: "center", fontSize: '16px' }}>A53T SNCA iDA</th>
                          </tr>
                        </thead>
                        <tbody>
                          {geneTableData.data.map((row, index) => (
                            <tr key={index}>
                              <td style={{ border: "1px solid #ddd", padding: "10px", textAlign: "center", fontWeight: "bold", fontSize: '16px' }}>
                                {row.mr3}
                              </td>
                              <td style={{ border: "1px solid #ddd", padding: "10px", textAlign: "center", fontSize: '16px' }}>
                                {row.gbm !== null ? row.gbm : '-'}
                              </td>
                              <td style={{ border: "1px solid #ddd", padding: "10px", textAlign: "center", fontSize: '16px' }}>
                                {row.ipsc !== null ? row.ipsc : '-'}
                              </td>
                              <td style={{ border: "1px solid #ddd", padding: "10px", textAlign: "center", fontSize: '16px' }}>
                                {row.a53t_ipsc !== null ? row.a53t_ipsc : '-'}
                              </td>
                              <td style={{ border: "1px solid #ddd", padding: "10px", textAlign: "center", fontSize: '16px' }}>
                                {row.ida !== null ? row.ida : '-'}
                              </td>
                              <td style={{ border: "1px solid #ddd", padding: "10px", textAlign: "center", fontSize: '16px' }}>
                                {row.a53t_ida !== null ? row.a53t_ida : '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div style={{ marginTop: 30 }}>
                      <h5 style={{ fontSize: '16px', marginBottom: '10px' }}>Heatmap Visualization</h5>
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
                                autorange: "reversed"
                              },
                              width: 900,
                              height: 300,
                              margin: { l: 80, r: 120, t: 60, b: 150 }
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
                                height: 300,
                                width: 900,
                                scale: 1
                              }
                            }}
                            style={{ width: "900px", height: "300px" }}
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
            </>
        )}
      </div>
  );
}