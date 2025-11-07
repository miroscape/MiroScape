import React from 'react';
import {Breadcrumb, Layout, Menu, Row, theme, Input, Col, Typography, Image} from "antd";
import {useEffect, useState} from "react";
import {Outlet, useLocation, useNavigate} from "react-router-dom";
import {RiBrainLine, RiDatabaseLine, RiEarthLine, RiHome5Line, RiMickeyLine, RiTeamLine} from "@remixicon/react";
import VolcanoPlot from "../PlotGenerators/VolcanoPlot";
const {Header, Content ,Sider} = Layout;

const PopulationAnalysis=()=>{
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const [shouldRenderOtherComponents,setShouldRenderOtherComponents]=useState(false)
    const location = useLocation();
    useEffect(()=>{
        setShouldRenderOtherComponents(location.pathname.startsWith('/miroScripts/populationAnalysis'))
    },[location.pathname])

    return (
        <div>
            {shouldRenderOtherComponents && (
                <VolcanoPlot 
                    dataUrl="TCGA_GBM_vs_Brain.csv"
                />
            )}
        </div>
    );
}
export default PopulationAnalysis;