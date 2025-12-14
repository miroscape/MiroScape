import React, { useState, useEffect } from "react";
import * as XLSX from 'xlsx';
import Plot from 'react-plotly.js';
import {useLocation} from "react-router-dom";
import {Col, Row} from "antd";
import {Content} from "antd/es/layout/layout";

export default function MitoSurf() {
  const [geneTableData, setGeneTableData] = useState(null);
  const [geneQuery, setGeneQuery] = useState("");
  const [excelData, setExcelData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [shouldRenderOtherComponents, setShouldRenderOtherComponents] = useState(false);
  const location = useLocation();

  const loadExcelFile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.PUBLIC_URL}/data/MitoSurf.xlsx`);
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
    setShouldRenderOtherComponents(location.pathname === '/mitoSurf')
  }, [location.pathname]);

  const makeGeneTableOne = (gene, digits = 3) => {
    if (!excelData || excelData.length === 0) return null;

    const headers = excelData[0];
    const dataRows = excelData.slice(1);

    // Find the gene column index
    const geneColIndex = headers.findIndex(h => 
      typeof h === 'string' && h.toLowerCase().includes('gene')
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

    const subMitoLoc = getColumnText("localization from Mitocarta3.0 database");
    const cellularLoc = getColumnText("cellular localization from native org. IP database");

    const gbm_egfp = getColumnValue("GBM-EGFP log2 Avg MS intensity");
    const gbm_egfp_mr3 = getColumnValue("GBM-EGFP-MR3 log2 Avg MS intensity");
    const gbm_omm = getColumnValue("GBM-OMM log2 Avg MS intensity");
    const gbm_omm_mr3 = getColumnValue("GBM-OMM-MR3 log2 Avg MS intensity");
    const gbm_miro1_wt = getColumnValue("GBM-Miro1-WT log2 Avg MS intensity");
    const gbm_miro1_wt_mr3 = getColumnValue("GBM-Miro1-WT-MR3 log2 Avg MS intensity");
    const gbm_miro1_kk = getColumnValue("GBM-Miro1-KK log2 Avg MS intensity");
    const gbm_miro1_kk_mr3 = getColumnValue("GBM-Miro1-KK-MR3 log2 Avg MS intensity");
    const gbm_miro1_v4 = getColumnValue("GBM-Miro1-v4 log2 Avg MS intensity");
    const gbm_miro1_v4_mr3 = getColumnValue("GBM-Miro1-v4-MR3 log2 Avg MS intensity");
    const hek_egfp = getColumnValue("HEK EGFP log2 Avg MS intensity");
    const hek_omm = getColumnValue("HEK OMM log2 Avg MS intensity");
    const hek_miro1v4 = getColumnValue("HEK Miro1v4 log2 Avg MS intensity");
    const hek_miro1_wt = getColumnValue("HEK Miro1-WT log2 Avg MS intensity");
    const hek_miro1_wt_mr3 = getColumnValue("HEK Miro1-WT-MR3 log2 Avg MS intensity");
    const hek_miro1_kk = getColumnValue("HEK Miro1-KK log2 Avg MS intensity");
    const in_t53a_sncomm = getColumnValue("iN T53A\\s+SNCOMM log2 Avg MS intensity");
    const in_a53t_snca_omm = getColumnValue("iN A53T SNCA OMM log2 Avg MS intensity");

    const formatValue = (val) => {
      if (val === null || val === undefined) return null;
      return Math.round(val * Math.pow(10, digits)) / Math.pow(10, digits);
    };

    return {
      gene: gene,
      proteinInfo: {
        subMitoLoc,
        cellularLoc
      },
      data: {
        gbm_egfp: formatValue(gbm_egfp),
        gbm_egfp_mr3: formatValue(gbm_egfp_mr3),
        gbm_omm: formatValue(gbm_omm),
        gbm_omm_mr3: formatValue(gbm_omm_mr3),
        gbm_miro1_wt: formatValue(gbm_miro1_wt),
        gbm_miro1_wt_mr3: formatValue(gbm_miro1_wt_mr3),
        gbm_miro1_kk: formatValue(gbm_miro1_kk),
        gbm_miro1_kk_mr3: formatValue(gbm_miro1_kk_mr3),
        gbm_miro1_v4: formatValue(gbm_miro1_v4),
        gbm_miro1_v4_mr3: formatValue(gbm_miro1_v4_mr3),
        hek_egfp: formatValue(hek_egfp),
        hek_omm: formatValue(hek_omm),
        hek_miro1v4: formatValue(hek_miro1v4),
        hek_miro1_wt: formatValue(hek_miro1_wt),
        hek_miro1_wt_mr3: formatValue(hek_miro1_wt_mr3),
        hek_miro1_kk: formatValue(hek_miro1_kk),
        in_t53a_sncomm: formatValue(in_t53a_sncomm),
        in_a53t_snca_omm: formatValue(in_a53t_snca_omm)
      }
    };
  };

  const generateHeatmapData = (geneData) => {
    if (!geneData) return null;

    const xLabels = [
      "GBM-EGFP",
      "GBM-EGFP-MR3",
      "GBM-OMM",
      "GBM-OMM-MR3",
      "GBM-Miro1-WT",
      "GBM-Miro1-WT-MR3",
      "GBM-Miro1-KK",
      "GBM-Miro1-KK-MR3",
      "GBM-Miro1-v4",
      "GBM-Miro1-v4-MR3",
      "HEK EGFP",
      "HEK OMM",
      "HEK Miro1v4",
      "HEK Miro1-WT",
      "HEK Miro1-WT-MR3",
      "HEK Miro1-KK",
      "iN T53A SNCOMM",
      "iN A53T SNCA OMM"
    ];

    const zValues = [[
      geneData.data.gbm_egfp,
      geneData.data.gbm_egfp_mr3,
      geneData.data.gbm_omm,
      geneData.data.gbm_omm_mr3,
      geneData.data.gbm_miro1_wt,
      geneData.data.gbm_miro1_wt_mr3,
      geneData.data.gbm_miro1_kk,
      geneData.data.gbm_miro1_kk_mr3,
      geneData.data.gbm_miro1_v4,
      geneData.data.gbm_miro1_v4_mr3,
      geneData.data.hek_egfp,
      geneData.data.hek_omm,
      geneData.data.hek_miro1v4,
      geneData.data.hek_miro1_wt,
      geneData.data.hek_miro1_wt_mr3,
      geneData.data.hek_miro1_kk,
      geneData.data.in_t53a_sncomm,
      geneData.data.in_a53t_snca_omm
    ]];

    const allValues = zValues.flat().filter(v => v !== null);
    const maxValue = Math.max(...allValues);

    return {
      x: xLabels,
      y: ["Expression"],
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
        title: "Log2 Average MS Intensity",
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
        "<b>%{x}</b><br>" +
        "Expression: %{z}<br>" +
        "<extra></extra>"
    };
  };

  const handleGeneSearch = () => {
    const result = makeGeneTableOne(geneQuery);
    setGeneTableData(result);
    if (result) {
      console.log('Gene data found:', result);
    } else {
      console.log('Gene not found');
    }
  };

  const heatmapTrace = geneTableData ? generateHeatmapData(geneTableData) : null;
  
  // Add debug logging
  useEffect(() => {
    if (heatmapTrace) {
      console.log('Heatmap trace generated:', heatmapTrace);
    }
  }, [heatmapTrace]);

  return (
      <div>
        {shouldRenderOtherComponents && (
            <>
              <Row>
                <Col span={24}>
                  <Content style={{ fontWeight: 'bold', padding: '12px 24px', fontSize: '24px', fontFamily: 'Arial' }}>
                    Welcome to MitoSurf!
                  </Content>
                  <Content style={{ padding: '0 24px', fontSize: '18px', fontFamily: 'Arial' }}>
                    Here we provide LOV-Turbo-Miro1 proximity labeling data across contexts. Mean MS values are shown and expressed as heatmaps.
                  </Content>
                  <Content style={{ fontWeight: 'bold', padding: '12px 24px 6px 24px', fontSize: '18px', fontFamily: 'Arial' }}>
                    If using MitoSurf or the data provided, please cite:
                  </Content>
                  <Content style={{ padding: '0 24px', fontSize: '18px', fontFamily: 'Arial' }}>
                    Kwak, C.S.; Du, Z.; Creery, J.S.; Zarbock, E.W.; Major, M.B.; Elias, J.E.; Wang, X. (2025).
                    Optogenetic Proximity Labeling Maps Spatially Resolved Mitochondrial Surface Proteomes and a Locally Regulated Ribosome Pool.
                  </Content>
                </Col>
              </Row>
              <div style={{ maxWidth: 1600, margin: "0", padding: "0px 20px 20px 20px" }}>
                <h2 style={{ fontSize: '22px' }}>Search Your Protein in Our Data!</h2>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: '16px' }}>Gene Name: </label>
                  <input
                    value={geneQuery}
                    onChange={(e) => setGeneQuery(e.target.value)}
                    placeholder="Enter gene name (e.g., FKBP8)"
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
                        <strong>Sub-Mitochondrial localization (from Mitocarta3.0):</strong> {geneTableData.proteinInfo.subMitoLoc || 'N/A'}
                      </p>
                      <p style={{ fontSize: '16px', marginBottom: '0' }}>
                        <strong>Cellular localization (from native org. IP):</strong> {geneTableData.proteinInfo.cellularLoc || 'N/A'}
                      </p>
                    </div>

                    <h4 style={{ fontSize: '16px', marginBottom: '10px' }}>Protein Log2 Average MS Intensity for {geneTableData.gene}</h4>

                    <div style={{ marginBottom: 20, overflowX: 'auto' }}>
                      <h5 style={{ fontSize: '16px', marginBottom: '20px' }}>Data Table</h5>
                      <table style={{ borderCollapse: "collapse", fontSize: 14, marginBottom: 20 }}>
                        <thead>
                          <tr style={{ backgroundColor: "#f5f5f5" }}>
                            <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center", fontSize: '14px' }}>GBM-EGFP</th>
                            <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center", fontSize: '14px' }}>GBM-EGFP-MR3</th>
                            <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center", fontSize: '14px' }}>GBM-OMM</th>
                            <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center", fontSize: '14px' }}>GBM-OMM-MR3</th>
                            <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center", fontSize: '14px' }}>GBM-Miro1-WT</th>
                            <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center", fontSize: '14px' }}>GBM-Miro1-WT-MR3</th>
                            <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center", fontSize: '14px' }}>GBM-Miro1-KK</th>
                            <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center", fontSize: '14px' }}>GBM-Miro1-KK-MR3</th>
                            <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center", fontSize: '14px' }}>GBM-Miro1-v4</th>
                            <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center", fontSize: '14px' }}>GBM-Miro1-v4-MR3</th>
                            <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center", fontSize: '14px' }}>HEK EGFP</th>
                            <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center", fontSize: '14px' }}>HEK OMM</th>
                            <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center", fontSize: '14px' }}>HEK Miro1v4</th>
                            <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center", fontSize: '14px' }}>HEK Miro1-WT</th>
                            <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center", fontSize: '14px' }}>HEK Miro1-WT-MR3</th>
                            <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center", fontSize: '14px' }}>HEK Miro1-KK</th>
                            <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center", fontSize: '14px' }}>iN T53A SNCOMM</th>
                            <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center", fontSize: '14px' }}>iN A53T SNCA OMM</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center", fontSize: '14px' }}>
                              {geneTableData.data.gbm_egfp !== null ? geneTableData.data.gbm_egfp : '-'}
                            </td>
                            <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center", fontSize: '14px' }}>
                              {geneTableData.data.gbm_egfp_mr3 !== null ? geneTableData.data.gbm_egfp_mr3 : '-'}
                            </td>
                            <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center", fontSize: '14px' }}>
                              {geneTableData.data.gbm_omm !== null ? geneTableData.data.gbm_omm : '-'}
                            </td>
                            <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center", fontSize: '14px' }}>
                              {geneTableData.data.gbm_omm_mr3 !== null ? geneTableData.data.gbm_omm_mr3 : '-'}
                            </td>
                            <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center", fontSize: '14px' }}>
                              {geneTableData.data.gbm_miro1_wt !== null ? geneTableData.data.gbm_miro1_wt : '-'}
                            </td>
                            <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center", fontSize: '14px' }}>
                              {geneTableData.data.gbm_miro1_wt_mr3 !== null ? geneTableData.data.gbm_miro1_wt_mr3 : '-'}
                            </td>
                            <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center", fontSize: '14px' }}>
                              {geneTableData.data.gbm_miro1_kk !== null ? geneTableData.data.gbm_miro1_kk : '-'}
                            </td>
                            <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center", fontSize: '14px' }}>
                              {geneTableData.data.gbm_miro1_kk_mr3 !== null ? geneTableData.data.gbm_miro1_kk_mr3 : '-'}
                            </td>
                            <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center", fontSize: '14px' }}>
                              {geneTableData.data.gbm_miro1_v4 !== null ? geneTableData.data.gbm_miro1_v4 : '-'}
                            </td>
                            <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center", fontSize: '14px' }}>
                              {geneTableData.data.gbm_miro1_v4_mr3 !== null ? geneTableData.data.gbm_miro1_v4_mr3 : '-'}
                            </td>
                            <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center", fontSize: '14px' }}>
                              {geneTableData.data.hek_egfp !== null ? geneTableData.data.hek_egfp : '-'}
                            </td>
                            <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center", fontSize: '14px' }}>
                              {geneTableData.data.hek_omm !== null ? geneTableData.data.hek_omm : '-'}
                            </td>
                            <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center", fontSize: '14px' }}>
                              {geneTableData.data.hek_miro1v4 !== null ? geneTableData.data.hek_miro1v4 : '-'}
                            </td>
                            <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center", fontSize: '14px' }}>
                              {geneTableData.data.hek_miro1_wt !== null ? geneTableData.data.hek_miro1_wt : '-'}
                            </td>
                            <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center", fontSize: '14px' }}>
                              {geneTableData.data.hek_miro1_wt_mr3 !== null ? geneTableData.data.hek_miro1_wt_mr3 : '-'}
                            </td>
                            <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center", fontSize: '14px' }}>
                              {geneTableData.data.hek_miro1_kk !== null ? geneTableData.data.hek_miro1_kk : '-'}
                            </td>
                            <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center", fontSize: '14px' }}>
                              {geneTableData.data.in_t53a_sncomm !== null ? geneTableData.data.in_t53a_sncomm : '-'}
                            </td>
                            <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center", fontSize: '14px' }}>
                              {geneTableData.data.in_a53t_snca_omm !== null ? geneTableData.data.in_a53t_snca_omm : '-'}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div style={{ marginTop: 30 }}>
                      <h5 style={{ fontSize: '16px', marginBottom: '10px' }}>Heatmap Visualization</h5>
                      <div style={{ display: "flex", justifyContent: "center" }}>
                        {heatmapTrace && (
                          <Plot
                            key={geneTableData.gene}
                            data={[heatmapTrace]}
                            layout={{
                              title: `Protein Expression Heatmap for ${geneTableData.gene}`,
                              xaxis: {
                                title: "Conditions",
                                side: "bottom",
                                tickangle: -45,
                                tickfont: { size: 12 },
                                titlefont: { size: 12 }
                              },
                              yaxis: {
                                title: "Expression",
                                showticklabels: false,
                                titlefont: { size: 12 }
                              },
                              width: 1100,
                              height: 300,
                              margin: { l: 60, r: 160, t: 50, b: 150 } // 增加右边距以容纳 Colorbar 标题
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
                                width: 1100,
                                scale: 1
                              }
                            }}
                            style={{ width: "1100px", height: "300px" }}
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