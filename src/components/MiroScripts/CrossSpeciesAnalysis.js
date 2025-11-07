import React from 'react';
import {Breadcrumb, Col, Image, Input, Layout, Menu, Row, theme, Typography} from "antd";
import {useEffect, useState} from "react";
import {Outlet, useLocation, useNavigate} from "react-router-dom";
import {RiBrainLine, RiDatabaseLine, RiEarthLine, RiHome5Line, RiMickeyLine, RiTeamLine} from "@remixicon/react";
import CrossSpeciesQuery from "../PlotGenerators/CrossSpeciesQuerry";

const {Header, Content ,Sider} = Layout;

const CrossSpeciesAnalysis=()=>{
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const [shouldRenderOtherComponents,setShouldRenderOtherComponents]=useState(false)
    const location = useLocation();
    useEffect(()=>{
        setShouldRenderOtherComponents(location.pathname.startsWith('/miroScripts/crossSpeciesAnalysis'))
    },[location.pathname])

    return (
        <div>
            {shouldRenderOtherComponents && (
                <div style={{ 
                    width: '100%',
                    padding: '0 20px'
                }}>
                    <CrossSpeciesQuery />
                </div>
            )}
        </div>
    );
}
export default CrossSpeciesAnalysis;