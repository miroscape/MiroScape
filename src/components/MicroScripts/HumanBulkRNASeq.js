import React from 'react';
// import {HomeOutlined} from '@ant-design/icons';
import {Breadcrumb, Col, Image, Input, Layout, Menu, Row, theme, Typography} from "antd";
import {useEffect, useState} from "react";
import {Outlet, useLocation, useNavigate} from "react-router-dom";
import {RiBrainLine, RiDatabaseLine, RiEarthLine, RiHome5Line, RiMickeyLine, RiTeamLine} from "@remixicon/react";
import VolcanoPlot from "../PlotGenerators/VolcanoPlot";
// import Sider from "antd/es/layout/Sider";
const {Header, Content ,Sider} = Layout;

const HumanBulkRNASeq=()=>{
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const [shouldRenderOtherComponents,setShouldRenderOtherComponents]=useState(false)
    const location = useLocation();
    useEffect(()=>{
        setShouldRenderOtherComponents(location.pathname.startsWith('/miroScripts/humanBulkRNASeq'))
    },[location.pathname])

    return (

        <div>
            {shouldRenderOtherComponents && (
                <VolcanoPlot dataUrl="deseq2_results_with_plain.csv"/>
            )}
        </div>
    );
}
export default HumanBulkRNASeq;