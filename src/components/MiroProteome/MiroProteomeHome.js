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
                            <Content style={{ padding: '0 24px',fontSize:'18px',fontFamily:'Arial'}}>
                                Here we provide whole-cell proteomic data across cell lines and models, with or without modulating MIRO1.
                            </Content>
                        </Col>
                    </Row>
                </>
            )}
        </div>
    );
}
export default MiroProteomeHome;