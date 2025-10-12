import React from 'react';
// import {HomeOutlined} from '@ant-design/icons';
import {Breadcrumb, Col, Layout, Menu, Row, theme} from "antd";
import {useEffect, useState} from "react";
import {Outlet, useLocation, useNavigate} from "react-router-dom";
import {RiBrainLine, RiDatabaseLine, RiEarthLine, RiHome5Line, RiMickeyLine, RiTeamLine} from "@remixicon/react";
// import Sider from "antd/es/layout/Sider";
const {Header, Content ,Sider} = Layout;

const MicroScriptsHome=()=>{
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const [shouldRenderOtherComponents,setShouldRenderOtherComponents]=useState(false)
    const location = useLocation();
    useEffect(()=>{
        setShouldRenderOtherComponents(location.pathname.startsWith('/microScripts/home'))
    },[location.pathname])

    return (

        <div>
            {shouldRenderOtherComponents && (
                <>
                    <Row>
                        <Col span={6}>
                            <Image
                                src={require('../..//assets/labicon.jpg')}
                            />
                        </Col>
                        <Col span={18}>
                            <Content style={{ padding: '12px 36px',fontSize:'36px'}}>
                                Welcome to MiroScripts!
                            </Content>
                            <Content style={{ padding: '12px 36px',fontSize:'18px'}}>
                                This interactive platform presents integrated transcriptomic analyses of glioma, combining TCGA bulk RNA-seq, MR3-treated mouse snRNA-seq, and ex vivo treated human tumor samples. Users can interactively explore cell-type patterns, compare across species, and download key gene expression results. The platform enables investigation of conserved transcriptional pathways associated with mitochondrial regulator Miro1 perturbation.
                            </Content>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={24}>
                            <Content style={{ padding: '12px 36px',fontSize:'36px'}}>

                                If using MiroScape or the data provided, please cite:
                            </Content>
                            <Content style={{ padding: '12px 36px',fontSize:'18px'}}>
                                Du, Z.; Li, M.; Bergsneider, B.H.; Tsai, A.P.; Cho, K.B.; Choi, J.; Kim, L.; Li, G.; Wyss-Coray, T.; Lim, M.; Wang, X. Cross-Species Transcriptomic Integration Reveals a Conserved, Miro1-Mediated Macrophage-to-T Cell Signaling Axis Driving Immunosuppression in Glioma. (Under review. Will update the link later.)
                            </Content>
                            <Content style={{ padding: '12px 36px',fontSize:'36px'}}>
                                Contact:
                            </Content>
                            <Content style={{ padding: '12px 36px',fontSize:'18px'}}>
                                Comments, suggestions, questions are welcomed, and should be directed to Xinnan Wang (xinnanw@stanford.edu)
                            </Content>
                        </Col>
                    </Row>
                </>
            )}
        </div>
    );
}
export default MicroScriptsHome;