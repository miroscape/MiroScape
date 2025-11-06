import React from 'react';
// import {HomeOutlined} from '@ant-design/icons';
import {Breadcrumb, Col, Layout, Menu, Row, theme,Image} from "antd";
import {useEffect, useState} from "react";
import {Outlet, useLocation, useNavigate} from "react-router-dom";
import {RiBrainLine, RiDatabaseLine, RiEarthLine, RiHome5Line, RiMickeyLine, RiTeamLine} from "@remixicon/react";
// import Sider from "antd/es/layout/Sider";
const {Header, Content ,Sider} = Layout;

const MiroScriptsHome=()=>{
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const [shouldRenderOtherComponents,setShouldRenderOtherComponents]=useState(false)
    const location = useLocation();
    useEffect(()=>{
        setShouldRenderOtherComponents(location.pathname.startsWith('/miroScripts/home'))
    },[location.pathname])

    return (

        <div>
            {shouldRenderOtherComponents && (
                <>
                    <Row>
                        <Col span={5}>
                            <Image style={{ padding: '10px 0px 10px 20px'}}
                                src={require('../../assets/logo-chem1.png')}
                            />
                        </Col>
                        <Col span={19}>
                            <Content style={{  fontWeight: 'bold',padding: '12px 24px',fontSize:'24px',fontFamily:'Arial'}}>
                                Welcome to MiroScripts!
                            </Content>
                            <Content style={{ padding: '0 24px',fontSize:'18px',fontFamily:'Arial'}}>
                                This interactive platform presents integrated transcriptomic analyses of glioma, combining TCGA bulk RNA-seq, MR3-treated mouse snRNA-seq, and ex vivo treated human tumor samples. Users can interactively explore cell-type patterns, compare across species, and download key gene expression results. The platform enables investigation of conserved transcriptional pathways associated with mitochondrial regulator Miro1 perturbation.
                            </Content>
                            <Content style={{ fontWeight: 'bold',padding: '24px 24px 6px 24px',fontSize:'18px',fontFamily:'Arial'}}>
                                If using MiroScape or the data provided, please cite:
                            </Content>
                            <Content style={{ padding: '0 24px',fontSize:'18px',fontFamily:'Arial'}}>
                                Du, Z.*; Li, M-H.*; Bergsneider, B.H.; Tsai, A.P.; Cho, K; Kim, L.H.; Choi, J.H.; Li, G.; Wyss-Coray, T.; Lim, M.; Wang, X. Cross-Species Transcriptomic Integration Reveals a Conserved, MIRO1-Mediated Macrophage-to-T Cell Signaling Axis Driving Immunosuppression in Glioma. (Under review. Will update the link later.)
                            </Content>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={24}>
                            <Image style={{ padding: '20px 100px'}}
                                   src={require('../../assets/workload.png')}
                            />
                        </Col>
                    </Row>
                </>
            )}
        </div>
    );
}
export default MiroScriptsHome;