import React from 'react';
// import {HomeOutlined} from '@ant-design/icons';
import {Breadcrumb, Layout, Menu, theme} from "antd";
import {useEffect, useState} from "react";
import {Outlet, useLocation, useNavigate} from "react-router-dom";
import {RiBrainLine, RiDatabaseLine, RiEarthLine, RiHome5Line, RiMickeyLine, RiTeamLine} from "@remixicon/react";
// import Sider from "antd/es/layout/Sider";
const {Header, Content ,Sider} = Layout;

const HumanBulkRNASeq=()=>{
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const [shouldRenderOtherComponents,setShouldRenderOtherComponents]=useState(false)
    const location = useLocation();
    useEffect(()=>{
        setShouldRenderOtherComponents(location.pathname.startsWith('/microScripts/humanBulkRNASeq'))
    },[location.pathname])

    return (

        <div>
            {shouldRenderOtherComponents && (
                <Content style={{ padding: '0 24px', minHeight: 280 }}>HumanBulkRNASeq</Content>
            )}
        </div>
    );
}
export default HumanBulkRNASeq;