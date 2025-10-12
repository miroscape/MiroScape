import React from 'react';
import IframeResizer from 'iframe-resizer-react';

// import {HomeOutlined} from '@ant-design/icons';
import {Breadcrumb, Col, Layout, Menu, Row, theme} from "antd";
import {useEffect, useState} from "react";
import {Outlet, useLocation, useNavigate} from "react-router-dom";
import {RiBrainLine, RiDatabaseLine, RiEarthLine, RiHome5Line, RiMickeyLine, RiTeamLine} from "@remixicon/react";
// import Sider from "antd/es/layout/Sider";
const {Header, Content ,Sider} = Layout;

const MouseSnRNASeq=()=>{
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const [shouldRenderOtherComponents,setShouldRenderOtherComponents]=useState(false)
    const location = useLocation();
    useEffect(()=>{
        setShouldRenderOtherComponents(location.pathname.startsWith('/microScripts/mouseSnRNASeq'))
    },[location.pathname])

    return (

        <div>
            {shouldRenderOtherComponents && (
                <div style={{minHeight:670}}>
                    <iframe src="https://zehuidu.shinyapps.io/shinyapp/" width="400%" height="670" frameBorder="0"></iframe>
                </div>
                )}
        </div>
    );
}
export default MouseSnRNASeq;