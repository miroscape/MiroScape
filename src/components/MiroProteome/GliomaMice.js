import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import Plot from "react-plotly.js";
import { useLocation } from "react-router-dom";
import { Col, Row } from "antd";
import { Content } from "antd/es/layout/layout";

const conditions = [
  { key: "gbm", label: "GBM", pattern: /^GBM AVG$/i },
  { key: "wt", label: "WT", pattern: /^WT AVG$/i },
  { key: "gbmMr3", label: "GBM MR3", pattern: /^GBM\/MR3 AVG$/i },
  { key: "wtMr3", label: "WT MR3", pattern: /^WT\/MR3 AVG$/i }
];

export default function GliomaMice() {
  const [geneTableData, setGeneTableData] = useState(null);
  const [geneQuery, setGeneQuery] = useState("");
  const [excelData, setExcelData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notFoundGene, setNotFoundGene] = useState("");
  const [shouldRenderOtherComponents, setShouldRenderOtherComponents] = useState(false);
  const location = useLocation();

  const loadExcelFile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.PUBLIC_URL}/data/Sainz-GBM-Mice-AVG-imputed.xlsx`);
      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer);
      const sheetName = workbook.SheetNames.includes("AVG") ? "AVG" : workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      setExcelData(data);
    } catch (error) {
      console.error("Error loading Excel file:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExcelFile();
    setShouldRenderOtherComponents(location.pathname === "/miroProteome/gliomaMice");
  }, [location.pathname]);

  const getTableParts = () => {
    if (!excelData || excelData.length === 0) return null;

    const headerRowIndex = excelData.findIndex(row =>
      row.some(cell => typeof cell === "string" && cell.toLowerCase().includes("gene"))
    );

    if (headerRowIndex === -1) return null;

    return {
      headers: excelData[headerRowIndex],
      dataRows: excelData.slice(headerRowIndex + 1)
    };
  };

  const formatValue = (value, digits = 3) => {
    if (value === null || value === undefined || value === "") return null;
    const parsed = parseFloat(value);
    if (Number.isNaN(parsed)) return null;
    return Math.round(parsed * Math.pow(10, digits)) / Math.pow(10, digits);
  };

  const matchesGeneQuery = (geneNames, query) => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return false;

    return geneNames
      .toString()
      .split(/\s+/)
      .some(gene => gene.trim().toLowerCase() === normalizedQuery);
  };

  const makeGeneTableOne = (gene, digits = 3) => {
    const tableParts = getTableParts();
    if (!tableParts) return null;

    const { headers, dataRows } = tableParts;
    const geneColIndex = headers.findIndex(h =>
      typeof h === "string" && h.toLowerCase().includes("gene")
    );

    if (geneColIndex === -1) {
      console.log("Gene column not found");
      return null;
    }

    const geneRow = dataRows.find(row => row[geneColIndex] && matchesGeneQuery(row[geneColIndex], gene));
    if (!geneRow) {
      console.log(`Gene not found: ${gene}`);
      return null;
    }

    const getColumnValue = (pattern) => {
      const colIndex = headers.findIndex(h => typeof h === "string" && pattern.test(h.trim()));
      if (colIndex === -1) return null;
      return formatValue(geneRow[colIndex], digits);
    };

    const getColumnText = (pattern) => {
      const colIndex = headers.findIndex(h => typeof h === "string" && pattern.test(h.trim()));
      if (colIndex === -1) return null;
      return geneRow[colIndex] || null;
    };

    const data = conditions.reduce((acc, condition) => {
      acc[condition.key] = getColumnValue(condition.pattern);
      return acc;
    }, {});

    return {
      gene: gene.trim(),
      matchedGeneNames: geneRow[geneColIndex],
      proteinInfo: {
        accession: getColumnText(/^Accession no \(Uniprot\)$/i),
        uniFunction: getColumnText(/^UniFunction$/i),
        subMitoLoc: getColumnText(/^mitocarta3\.0 local$/i),
        mitoFunction: getColumnText(/^mitocarta3\.0_mitofunction$/i)
      },
      data
    };
  };

  const generateHeatmapData = (geneData) => {
    if (!geneData) return null;

    const zValues = [conditions.map(condition => geneData.data[condition.key])];
    const allValues = zValues.flat().filter(value => value !== null);
    const maxValue = allValues.length ? Math.max(...allValues) : 1;
    const minValue = allValues.length ? Math.min(...allValues) : 0;

    return {
      x: conditions.map(condition => condition.label),
      y: ["Log2 LFQ"],
      z: zValues,
      type: "heatmap",
      zmin: minValue,
      zmax: maxValue,
      colorscale: [
        [0, "#f8f9fa"],
        [0.2, "#dbeafe"],
        [0.55, "#60a5fa"],
        [1, "#1d4ed8"]
      ],
      showscale: true,
      colorbar: {
        title: "Log2 LFQ",
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
        "Log2 LFQ: %{z}<br>" +
        "<extra></extra>"
    };
  };

  const handleGeneSearch = () => {
    const result = makeGeneTableOne(geneQuery);
    setGeneTableData(result);
    setNotFoundGene(result ? "" : geneQuery.trim());
  };

  const heatmapTrace = geneTableData ? generateHeatmapData(geneTableData) : null;

  return (
    <div>
      {shouldRenderOtherComponents && (
        <>
          <Row>
            <Col span={24}>
              <Content style={{ fontWeight: "bold", padding: "12px 24px", fontSize: "24px", fontFamily: "Arial" }}>
                Welcome to MiroProteome-Glioma Mice!
              </Content>
              <Content style={{ padding: "0 24px", fontSize: "18px", fontFamily: "Arial" }}>
                This dataset contains mouse glioma proteomic data comparing GBM and WT samples with and without MR3 treatment.
              </Content>
              <Content style={{ fontWeight: "bold", padding: "12px 24px 6px 24px", fontSize: "18px", fontFamily: "Arial" }}>
                If using MiroProteome-Glioma Mice or the data provided, please cite:
              </Content>
              <Content style={{ padding: "0 24px", fontSize: "18px", fontFamily: "Arial" }}>
                Sainz, A.G.; Kwak, C.S.; Cho, K.B.; Sripadanna, S.A.; Bergsneider, B.H.; Zizzo, Z.;
                Durairaj, A.S.; Du, Z.; Cooney, I.; Venida, A.; Bharucha, N.; Karikakes, I.; Chiu, W.;
                Lim, M.; Bassik, M.; Wang, X. (2026).
                The MIRO1-BAX Complex Dictates Life and Death at the
                Mitochondrial Gate. DOI will be provided once online.
              </Content>
            </Col>
          </Row>

          <div style={{ maxWidth: 1200, margin: "0", padding: "0px 20px 20px 20px" }}>
            <h2 style={{ fontSize: "22px" }}>Search Your Protein in Our Data!</h2>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: "16px" }}>Gene Name: </label>
              <input
                value={geneQuery}
                onChange={(event) => setGeneQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") handleGeneSearch();
                }}
                placeholder="Enter gene name (e.g., Mcca)"
                style={{ marginRight: 10, padding: "8px", width: 250, fontSize: "16px" }}
              />
              <button
                onClick={handleGeneSearch}
                disabled={loading || !geneQuery.trim()}
                style={{ padding: "5px 16px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: 3, fontSize: "16px" }}
              >
                {loading ? "Loading..." : "Search Gene"}
              </button>
            </div>

            {geneTableData && (
              <div>
                <h4 style={{ fontSize: "18px", marginBottom: "15px" }}>Protein Information for {geneTableData.matchedGeneNames}</h4>

                <div style={{ marginBottom: 25, padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "5px" }}>
                  <p style={{ fontSize: "16px", marginBottom: "8px" }}>
                    <strong>Accession no (Uniprot):</strong> {geneTableData.proteinInfo.accession || "N/A"}
                  </p>
                  <p style={{ fontSize: "16px", marginBottom: "8px" }}>
                    <strong>Function:</strong> {geneTableData.proteinInfo.uniFunction || "N/A"}
                  </p>
                  <p style={{ fontSize: "16px", marginBottom: "8px" }}>
                    <strong>Sub-Mitochondrial localization (from Mitocarta3.0):</strong> {geneTableData.proteinInfo.subMitoLoc || "N/A"}
                  </p>
                  <p style={{ fontSize: "16px", marginBottom: 0 }}>
                    <strong>Mitocarta3.0 function:</strong> {geneTableData.proteinInfo.mitoFunction || "N/A"}
                  </p>
                </div>

                <h4 style={{ fontSize: "16px", marginBottom: "10px" }}>
                  Protein Log2 Transform LFQ for {geneTableData.matchedGeneNames}
                </h4>

                <div style={{ marginBottom: 20, overflowX: "auto" }}>
                  <h5 style={{ fontSize: "16px", marginBottom: "20px" }}>Data Table</h5>
                  <table style={{ borderCollapse: "collapse", fontSize: 16, marginBottom: 20 }}>
                    <thead>
                      <tr style={{ backgroundColor: "#f5f5f5" }}>
                        {conditions.map(condition => (
                          <th key={condition.key} style={{ border: "1px solid #ddd", padding: "10px", textAlign: "center", fontSize: "16px" }}>
                            {condition.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        {conditions.map(condition => (
                          <td key={condition.key} style={{ border: "1px solid #ddd", padding: "10px", textAlign: "center", fontSize: "16px" }}>
                            {geneTableData.data[condition.key] !== null ? geneTableData.data[condition.key] : "-"}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div style={{ marginTop: 30 }}>
                  <h5 style={{ fontSize: "16px", marginBottom: "10px" }}>Heatmap Visualization</h5>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    {heatmapTrace && (
                      <Plot
                        key={geneTableData.matchedGeneNames}
                        data={[heatmapTrace]}
                        layout={{
                          title: `Protein Expression Heatmap for ${geneTableData.matchedGeneNames}`,
                          xaxis: {
                            title: "Conditions",
                            side: "bottom",
                            tickfont: { size: 13 },
                            titlefont: { size: 13 }
                          },
                          yaxis: {
                            title: "Expression",
                            showticklabels: false,
                            titlefont: { size: 13 }
                          },
                          width: 720,
                          height: 280,
                          margin: { l: 70, r: 130, t: 55, b: 90 }
                        }}
                        config={{
                          displaylogo: false,
                          modeBarButtonsToRemove: [
                            "zoom2d", "pan2d", "select2d", "lasso2d",
                            "zoomIn2d", "zoomOut2d", "autoScale2d",
                            "resetScale2d"
                          ],
                          toImageButtonOptions: {
                            format: "svg",
                            filename: `${geneTableData.matchedGeneNames}_glioma_mice_heatmap`,
                            height: 280,
                            width: 720,
                            scale: 1
                          }
                        }}
                        style={{ width: "720px", height: "280px" }}
                      />
                    )}
                  </div>
                </div>
              </div>
            )}

            {notFoundGene && !loading && (
              <p style={{ color: "#b00020" }}>Gene "{notFoundGene}" not found.</p>
            )}

            {!geneTableData && !notFoundGene && !loading && (
              <p>Enter a gene name and click "Search Gene" to display expression data.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
