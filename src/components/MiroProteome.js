import React from 'react';
import {Layout, Menu, theme} from "antd";
import {useEffect, useState} from "react";
import {Outlet, useLocation, useNavigate} from "react-router-dom";
import TestPage from "./MiroProteome/FA";
import Sider from "antd/es/layout/Sider";
import {RiBrainLine, RiDatabaseLine, RiEarthLine, RiHome5Line, RiMickeyLine, RiTeamLine} from "@remixicon/react";
const { Header, Content } = Layout;

const items = [{icon:React.createElement(RiHome5Line),key: 'FA', label: 'FA'}];
const MiroProteome=()=>{
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();
    const [page,setPage]=useState('FA');
    const navigate = useNavigate();
    const onClick=(data)=>{
        console.log('click ', data);
        navigate(`/miroProteome/${data.key}`);
        setPage(data.key);
    };
    const [shouldRenderOtherComponents,setShouldRenderOtherComponents]=useState(false)
    const location = useLocation();
    useEffect(()=>{
        setShouldRenderOtherComponents(location.pathname.startsWith('/miroProteome'))
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
export default MiroProteome;