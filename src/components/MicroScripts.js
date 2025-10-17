import React from 'react';
// import {HomeOutlined} from '@ant-design/icons';
import {Breadcrumb, Layout, Menu, theme} from "antd";
import {useEffect, useState} from "react";
import {Outlet, useLocation, useNavigate} from "react-router-dom";
import {RiBrainLine, RiDatabaseLine, RiEarthLine, RiHome5Line, RiMickeyLine, RiTeamLine} from "@remixicon/react";
// import Sider from "antd/es/layout/Sider";
const {Header, Content ,Sider} = Layout;

const items = [{icon:React.createElement(RiHome5Line),key: 'home', label: 'Home'},
    {icon:React.createElement(RiBrainLine),key: 'populationAnalysis', label: 'Population Data'},
    {icon:React.createElement(RiMickeyLine),key: 'mouseSnRNASeq', label: 'Mouse snRNA'},
    {icon:React.createElement(RiTeamLine),key: 'humanBulkRNASeq', label: 'Human bulk RNA'},
    {icon:React.createElement(RiEarthLine),key: 'crossSpeciesAnalysis', label: 'Cross-species'},
    {icon:React.createElement(RiDatabaseLine),key: 'dataSource', label: 'Data Source'}];
const MicroScripts=()=>{
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();
    const [page,setPage]=useState('home');

    const navigate = useNavigate();
    const onClick=(data)=>{
        console.log('click ', data);
        navigate(`/microScripts/${data.key}`);
        setPage(data.key);
    };
    const [shouldRenderOtherComponents,setShouldRenderOtherComponents]=useState(false)
    const location = useLocation();
    useEffect(()=>{
        setShouldRenderOtherComponents(location.pathname.startsWith('/microScripts'))
    },[location.pathname])

    return (

        <div>
            {shouldRenderOtherComponents && (

                <Layout>
                    <div style={{ padding: '24px 48px' }}>
                        <Layout
                            style={{ padding: '24px 0', background: colorBgContainer, borderRadius: borderRadiusLG }}
                        >
                            <Sider style={{ background: colorBgContainer }} width={200}>
                                <Menu
                                    onClick={onClick}
                                    selectedKeys={[page]}
                                    mode="inline"
                                    style={{ height: '100%' }}
                                    items={items}
                                />
                            </Sider>
                            <Outlet/>
                        </Layout>
                    </div>
                </Layout>
            )}
        </div>
    );
}
export default MicroScripts;