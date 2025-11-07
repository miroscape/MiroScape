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
        setShouldRenderOtherComponents(location.pathname.startsWith('/miroScripts/mouseSnRNASeq'))
    },[location.pathname])

    return (
        <div>
            {shouldRenderOtherComponents && (
                <div style={{
                    width: '100%',
                    overflow: 'auto'
                }}>
                    <iframe 
                        src="https://xwanglab.shinyapps.io/shinyapp/" 
                        width="100%" 
                        height="800" 
                        frameBorder="0"
                        style={{ 
                            border: 'none',
                            minWidth: '1400px'
                        }}
                    ></iframe>
                </div>
            )}
        </div>
    );
}
export default MouseSnRNASeq;