import React from 'react';
// import {HomeOutlined} from '@ant-design/icons';
import {Breadcrumb, Col, Layout, Menu, Row, theme,Image} from "antd";
import {useEffect, useState} from "react";
import {Outlet, useLocation, useNavigate} from "react-router-dom";
import {RiBrainLine, RiDatabaseLine, RiEarthLine, RiHome5Line, RiMickeyLine, RiTeamLine} from "@remixicon/react";
// import Sider from "antd/es/layout/Sider";
const {Header, Content ,Sider} = Layout;

const GliomaMice=()=>{
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const [shouldRenderOtherComponents,setShouldRenderOtherComponents]=useState(false)
    const location = useLocation();
    useEffect(()=>{
        setShouldRenderOtherComponents(location.pathname.startsWith('/miroProteome/gliomaMice'))
    },[location.pathname])

    return (

        <div>
            {shouldRenderOtherComponents && (
                <Content style={{ padding: '24px 48px' }}>
                    <div>
                        GliomaMice
                    </div>
                </Content>
            )}
        </div>
    );
}
export default GliomaMice;