import React, { useState, useEffect } from "react";
import * as XLSX from 'xlsx';
import Plot from 'react-plotly.js';
import {useLocation} from "react-router-dom";
import {Col, Image, Row} from "antd";
import {Content} from "antd/es/layout/layout";

export default function FA() {
  const [geneTableData, setGeneTableData] = useState(null);
  const [geneQuery, setGeneQuery] = useState("");
  const [excelData, setExcelData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [shouldRenderOtherComponents,setShouldRenderOtherComponents]=useState(false)
  const location = useLocation();

  const loadExcelFile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.PUBLIC_URL}/data/Chandra-FA-imputed.xlsx`);
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
    setShouldRenderOtherComponents(location.pathname === '/miroProteome/FA')
  }, [location.pathname]);

  const makeGeneTableOne = (gene, digits = 3) => {
    if (!excelData || excelData.length === 0) return null;

    const headers = excelData[0];
    const dataRows = excelData.slice(1);

    let geneColIndex = headers.findIndex(h => 
      typeof h === 'string' && h.toLowerCase().includes('gene')
    );
    if (geneColIndex === -1) geneColIndex = 1;

    const geneRow = dataRows.find(row => row[geneColIndex] === gene);
    if (!geneRow) {
      console.log(`Gene not found: ${gene}`);
      return null;
    }

    const getOne = (pattern) => {
      const regex = new RegExp(pattern, 'i');
      const colIndex = headers.findIndex(h => typeof h === 'string' && regex.test(h));
      if (colIndex === -1) return null;
      const value = parseFloat(geneRow[colIndex]);
      return isNaN(value) ? null : value;
    };

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
          fibroblasts_fa: null, 
          fibroblasts_hc: null
        }
      ]
    };
  };

  const generateHeatmapData = (geneData) => {
    if (!geneData) return null;

    const xLabels = [
      "Cardiomyocytes FA",
      "Cardiomyocytes Iso Ctrl", 
      "Sensory Neurons FA",
      "Sensory Neurons Iso Ctrl",
      "Fibroblasts FA",
      "Fibroblasts HC"
    ];

    const yLabels = ["MR3_+", "MR3_-"];

    const zValues = [
      [
        geneData.data[1].cardiomyocytes_fa,
        geneData.data[1].cardiomyocytes_iso,
        geneData.data[1].sensory_neurons_fa,
        geneData.data[1].sensory_neurons_iso,
        geneData.data[1].fibroblasts_fa,
        geneData.data[1].fibroblasts_hc
      ],
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
                {/* <Col span={5}>
                  <Image style={{ padding: '10px 10px 0px 30px'}}
                         src={require('../../assets/logo-chem1.png')}
                  />
                </Col> */}
                <Col span={24}>
                  <Content style={{ fontWeight: 'bold', padding: '12px 24px', fontSize: '24px', fontFamily: 'Arial' }}>
                    Welcome to MiroProteome-FA!
                  </Content>
                  <Content style={{ padding: '0 24px', fontSize: '18px', fontFamily: 'Arial' }}>
                    This dataset contains proteomic data from fibroblasts, sensory neurons, and cardiomyocytes derived from Friedreich's Ataxia (FA) patients and controls, with and without MR3 treatment.
                  </Content>
                  <Content style={{ fontWeight: 'bold', padding: '12px 24px 6px 24px', fontSize: '18px', fontFamily: 'Arial' }}>
                    If using MiroProteome-FA or the data provided, please cite:
                  </Content>
                  <Content style={{ padding: '0 24px', fontSize: '18px', fontFamily: 'Arial' }}>
                    Chandra, S.; Kwak, C.S.; Du, Z.; Barisano, G.; Nguyen, K.T.; Vinogradov, V.; Wang, X.(2025). 
                    Chemical Modulation of MIRO1 Alleviates Cell-Type-Specific Vulnerabilities in Friedreich's Ataxia.
                  </Content>
                  {/* <Content style={{ padding: '0 24px', fontSize: '18px', fontFamily: 'Arial' }}>
                    Du, Z.*; Li, M-H.*; Bergsneider, B.H.; Tsai, A.P.; Cho, K; Kim, L.H.; Choi, J.; Li, G.; Wyss-Coray, T.; Lim, M.; Wang, X. 
                    Cross-Species Transcriptomic Integration Reveals a Conserved, MIRO1-Mediated Macrophage-to-T Cell Signaling Axis Driving Immunosuppression in Glioma. 
                    <i> bioRxiv </i> (2025). {' '}
                    <a href="https://www.biorxiv.org/content/10.1101/2025.11.10.686781v1" target="_blank" rel="noopener noreferrer">
                    https://www.biorxiv.org/content/10.1101/2025.11.10.686781v1
                    </a>
                  </Content> */}
                </Col>
              </Row>
              <div style={{ maxWidth: 1200, margin: "0", padding: "0px 20px 20px 20px" }}>
                <h2 style={{ fontSize: '22px' }}>Search Your Protein in Our Data!</h2>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: '16px' }}>Gene Name: </label>
                  <input
                    value={geneQuery}
                    onChange={(e) => setGeneQuery(e.target.value)}
                    placeholder="Enter gene name (e.g., MYH7)"
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
                    <h4 style={{ fontSize: '16px', marginBottom: '10px' }}>Protein Log2(LFQ Intensity) for {geneTableData.gene}</h4>

                    <div style={{ marginBottom: 20 }}>
                      <h5 style={{ fontSize: '16px',marginBottom: '20px' }}>Data Table</h5>
                      <table style={{ borderCollapse: "collapse", fontSize: 16, marginBottom: 20 }}>
                        <thead>
                          <tr style={{ backgroundColor: "#f5f5f5" }}>
                            <th style={{ border: "1px solid #ddd", padding: "10px", textAlign: "center", fontSize: '16px' }}>MR3</th>
                            <th style={{ border: "1px solid #ddd", padding: "10px", textAlign: "center", fontSize: '16px' }}>Cardiomyocytes FA</th>
                            <th style={{ border: "1px solid #ddd", padding: "10px", textAlign: "center", fontSize: '16px' }}>Cardiomyocytes Iso Ctrl</th>
                            <th style={{ border: "1px solid #ddd", padding: "10px", textAlign: "center", fontSize: '16px' }}>Sensory Neurons FA</th>
                            <th style={{ border: "1px solid #ddd", padding: "10px", textAlign: "center", fontSize: '16px' }}>Sensory Neurons Iso Ctrl</th>
                            <th style={{ border: "1px solid #ddd", padding: "10px", textAlign: "center", fontSize: '16px' }}>Fibroblasts FA</th>
                            <th style={{ border: "1px solid #ddd", padding: "10px", textAlign: "center", fontSize: '16px' }}>Fibroblasts HC</th>
                          </tr>
                        </thead>
                        <tbody>
                          {geneTableData.data.map((row, index) => (
                            <tr key={index}>
                              <td style={{ border: "1px solid #ddd", padding: "10px", textAlign: "center", fontWeight: "bold", fontSize: '16px' }}>
                                {row.mr3}
                              </td>
                              <td style={{ border: "1px solid #ddd", padding: "10px", textAlign: "center", fontSize: '16px' }}>
                                {row.cardiomyocytes_fa !== null ? row.cardiomyocytes_fa : '-'}
                              </td>
                              <td style={{ border: "1px solid #ddd", padding: "10px", textAlign: "center", fontSize: '16px' }}>
                                {row.cardiomyocytes_iso !== null ? row.cardiomyocytes_iso : '-'}
                              </td>
                              <td style={{ border: "1px solid #ddd", padding: "10px", textAlign: "center", fontSize: '16px' }}>
                                {row.sensory_neurons_fa !== null ? row.sensory_neurons_fa : '-'}
                              </td>
                              <td style={{ border: "1px solid #ddd", padding: "10px", textAlign: "center", fontSize: '16px' }}>
                                {row.sensory_neurons_iso !== null ? row.sensory_neurons_iso : '-'}
                              </td>
                              <td style={{ border: "1px solid #ddd", padding: "10px", textAlign: "center", fontSize: '16px' }}>
                                {row.fibroblasts_fa !== null ? row.fibroblasts_fa : '-'}
                              </td>
                              <td style={{ border: "1px solid #ddd", padding: "10px", textAlign: "center", fontSize: '16px' }}>
                                {row.fibroblasts_hc !== null ? row.fibroblasts_hc : '-'}
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