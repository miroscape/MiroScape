import React, {useState} from 'react';

import { Breadcrumb, Layout, Menu, theme } from 'antd';
import {Outlet, useNavigate} from "react-router-dom";
const { Header, Content } = Layout;
const items = [{key: 'home', label: 'Home'},
    {key: 'microScripts', label: 'MicroScripts'},
    {key: 'mitoSurf', label: 'MitoSurf'},
    {key: 'microProteome', label: 'MiroProteome'}];
const Home = () => {
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const [page,setPage]=useState('microScripts');

    const navigate = useNavigate();
    const onClick=(data)=>{
        console.log('click ', data);
        navigate(`/${data.key}`);
        setPage(data.key);
    };

    return (
        <Layout style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header style={{
                position: 'sticky',display: 'flex', alignItems: 'center' }}>
                <div className="demo-logo" />
                <Menu
                    onClick={onClick}
                    selectedKeys={[page]}
                    theme="dark"
                    mode="horizontal"
                    // defaultSelectedKeys={['MicroScripts']}
                    items={items}
                    style={{ flex: 1, minWidth: 0 }}
                />
            </Header>
            <Outlet/>
        </Layout>
    );
};
export default Home;