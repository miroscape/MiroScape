import React from 'react';
// import {HomeOutlined} from '@ant-design/icons';
import {Breadcrumb, Layout, Menu, Row, theme, Input, Col, Typography, Image} from "antd";
import {useEffect, useState} from "react";
import {Outlet, useLocation, useNavigate} from "react-router-dom";
import {RiBrainLine, RiDatabaseLine, RiEarthLine, RiHome5Line, RiMickeyLine, RiTeamLine} from "@remixicon/react";
import VolcanoPlot from "../PlotGenerators/VolcanoPlot";
// import Sider from "antd/es/layout/Sider";
const {Header, Content ,Sider} = Layout;

const PopulationAnalysis=()=>{
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const [shouldRenderOtherComponents,setShouldRenderOtherComponents]=useState(false)
    const location = useLocation();
    useEffect(()=>{
        setShouldRenderOtherComponents(location.pathname.startsWith('/microScripts/populationAnalysis'))
    },[location.pathname])

    return (

        <div>
            {shouldRenderOtherComponents && (
                    <VolcanoPlot dataUrl="TCGA_GBM_vs_Brain.csv"/>
            )}
        </div>
    );
}
export default PopulationAnalysis;