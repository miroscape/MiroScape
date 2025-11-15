import {Col, Image, Layout, Row, theme} from "antd";
import React, {useEffect, useState} from "react";
import {Outlet, useLocation} from "react-router-dom";
const { Header, Content } = Layout;

const Introduction=()=>{
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();
    const [shouldRenderOtherComponents,setShouldRenderOtherComponents]=useState(false)
    const location = useLocation();
    useEffect(()=>{
        setShouldRenderOtherComponents(location.pathname === '/home')
    },[location.pathname])

    return (

        <div>
            {shouldRenderOtherComponents && (
                <Layout>
                    <div style={{ padding: '24px 48px' }}>
                        <Layout
                            style={{ padding: '24px 0', background: colorBgContainer, borderRadius: borderRadiusLG }}
                        >
                            <Row>
                                <Col span={4}>
                                    <Image style={{ padding: '12px 36px'}}
                                           src={require('../assets/labicon.jpg')}
                                    />
                                </Col>
                                <Col span={20}>
                                    <Content style={{  fontWeight: 'bold',padding: '12px 36px',fontSize:'26px',fontFamily:'Arial'}}>
                                        Welcome to MiroScape!
                                    </Content>
                                    <Content style={{ padding: '0 36px',fontSize:'20px',fontFamily:'Arial'}}>
                                        This platform brings together three different levels of datasets on MIRO1, a key outer mitochondrial membrane protein involved in regulating mitochondrial transport, dynamics, and signaling. MiroScripts explores transcriptomic changes, MitoSurf profiles the mitochondrial surface proteome, and MiroProteome captures whole-cell proteomic responses under pharmacological intervention or MIRO1 modulation. Together, our platform provides a multi-layered view of how MIRO1 shapes cellular and mitochondrial landscapes.
                                    </Content>
                                </Col>
                            </Row>
                            <Row>
                                <Col span={4}>
                                    <Image style={{ padding: '0px 12px'}}
                                           src={require('../assets/logo-chem1.png')}
                                    />
                                    <Image style={{ padding: '0px 12px'}}
                                           src={require('../assets/Stanford_Logo.png')}
                                    />
                                </Col>
                                <Col span={20}>
                                    <Content style={{ fontWeight: 'bold',padding: '12px 36px 6px 36px',fontSize:'22px',fontFamily:'Arial'}}>
                                        If using MiroScape or the data provided, please cite:
                                    </Content>
                                    <Content style={{ padding: '0 36px', fontSize: '20px', fontFamily: 'Arial' }}>
                                        Du, Z.*; Li, M-H.*; Bergsneider, B.H.; Tsai, A.P.; Cho, K; Kim, L.H.; Choi, J.; Li, G.; Wyss-Coray, T.; Lim, M.; Wang, X. (2025)
                                        Cross-Species Transcriptomic Integration Reveals a Conserved, MIRO1-Mediated Macrophage-to-T Cell Signaling Axis Driving Immunosuppression in Glioma. 
                                        <i> bioRxiv </i>  2025.11.10.686781; doi: <a href="https://www.biorxiv.org/content/10.1101/2025.11.10.686781v1" target="_blank" rel="noopener noreferrer">https://doi.org/10.1101/2025.11.10.686781</a>
                                    </Content>
                                    <Content style={{ fontWeight: 'bold',padding: '18px 36px 6px 36px',fontSize:'22px',fontFamily:'Arial'}}>
                                        Contact:
                                    </Content>
                                    <Content style={{ padding: '0 36px',fontSize:'20px',fontFamily:'Arial'}}>
                                        Comments, suggestions, questions are welcomed, and should be directed to Xinnan Wang (xinnanw@stanford.edu)
                                    </Content>
                                </Col>
                            </Row>
                        </Layout>
                    </div>
                </Layout>
            )}
        </div>
    );
}
export default Introduction;