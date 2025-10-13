
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
                                    <Content style={{  fontWeight: 'bold',padding: '12px 36px',fontSize:'24px',fontFamily:'Rubik'}}>
                                        Welcome to MiroScape!
                                    </Content>
                                    <Content style={{ padding: '0 36px',fontSize:'16px',fontFamily:'Rubik'}}>
                                        This platform brings together three different levels of datasets on Miro1, a key mitochondrial outer membrane protein involved in regulating mitochondrial dynamics and signaling. MiroScript explores transcriptomic changes, MitoSurf profiles the mitochondrial surface proteome, and Miro Proteome captures whole-cell proteomic responses under MR3 treatment or Miro1 modulation. Together, they provide a multi-layered view of how Miro1 shapes cellular and mitochondrial landscapes.
                                    </Content>
                                </Col>
                            </Row>
                            <Row>
                                <Col span={24}>
                                    <Content style={{ fontWeight: 'bold',padding: '12px 36px',fontSize:'24px',fontFamily:'Rubik'}}>
                                        If using MiroScape or the data provided, please cite:
                                    </Content>
                                    <Content style={{ padding: '0 36px',fontSize:'16px',fontFamily:'Rubik'}}>
                                        Du, Z.*; Li, M.*; Bergsneider, B.H.; Tsai, A.P.; Cho, K.B.; Choi, J.; Kim, L.; Li, G.; Wyss-Coray, T.; Lim, M.; Wang, X. Cross-Species Transcriptomic Integration Reveals a Conserved, Miro1-Mediated Macrophage-to-T Cell Signaling Axis Driving Immunosuppression in Glioma. (Under review. Will update the link later.)
                                    </Content>
                                    <Content style={{ fontWeight: 'bold',padding: '12px 36px',fontSize:'24px',fontFamily:'Rubik'}}>
                                        Contact:
                                    </Content>
                                    <Content style={{ padding: '0 36px',fontSize:'16px',fontFamily:'Rubik'}}>
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