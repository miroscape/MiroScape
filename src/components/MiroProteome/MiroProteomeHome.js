import React from 'react';
// import {HomeOutlined} from '@ant-design/icons';
import {Breadcrumb, Col, Layout, Menu, Row, theme,Image} from "antd";
import {useEffect, useState} from "react";
import {Outlet, useLocation, useNavigate} from "react-router-dom";
import {RiBrainLine, RiDatabaseLine, RiEarthLine, RiHome5Line, RiMickeyLine, RiTeamLine} from "@remixicon/react";
// import Sider from "antd/es/layout/Sider";
const {Header, Content ,Sider} = Layout;

const MiroProteomeHome=()=>{
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const [shouldRenderOtherComponents,setShouldRenderOtherComponents]=useState(false)
    const location = useLocation();
    useEffect(()=>{
        setShouldRenderOtherComponents(location.pathname.startsWith('/miroProteome/home'))
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
                                Welcome to MiroProteome!
                            </Content>
                            <Content style={{ padding: '0 24px',fontSize:'20px',fontFamily:'Arial'}}>
                                Here we provide whole-cell proteomic data across cell lines and models, with or without modulating MIRO1.
                            </Content>
                            <Content style={{ fontWeight: 'bold',padding: '24px 24px 6px 24px',fontSize:'20px',fontFamily:'Arial'}}>
                                If using MiroScape or the data provided, please cite:
                            </Content>
                            <Content style={{ padding: '0 24px', fontSize: '18px', fontFamily: 'Arial' }}>
                                Du, Z.*; Li, M-H.*; Bergsneider, B.H.; Tsai, A.P.; Cho, K; Kim, L.H.; Choi, J.; Li, G.; Wyss-Coray, T.; Lim, M.; Wang, X. (2025)
                                Cross-Species Transcriptomic Integration Reveals a Conserved, MIRO1-Mediated Macrophage-to-T Cell Signaling Axis Driving Immunosuppression in Glioma. 
                                <i> bioRxiv </i>  2025.11.10.686781; doi: <a href="https://www.biorxiv.org/content/10.1101/2025.11.10.686781v1" target="_blank" rel="noopener noreferrer">https://doi.org/10.1101/2025.11.10.686781</a>
                            </Content>
                        </Col>
                    </Row>
                </>
            )}
        </div>
    );
}
export default MiroProteomeHome;