import React from 'react';
// import {HomeOutlined} from '@ant-design/icons';
import {Breadcrumb, Button, Col, Flex, Layout, Menu, Row, Space, Table, theme} from "antd";
import {useEffect, useState} from "react";
import {Outlet, useLocation, useNavigate} from "react-router-dom";
import {RiBrainLine, RiDatabaseLine, RiEarthLine, RiHome5Line, RiMickeyLine, RiTeamLine} from "@remixicon/react";
// import Sider from "antd/es/layout/Sider";
const {Header, Content ,Sider} = Layout;
const columns = [
    {
        // title: 'Name',
        dataIndex: 'name',
        key: 'name',
    },
    {
        // title: 'Age',
        dataIndex: 'age',
        key: 'age',
    },
    {
        title: 'Action',
        key: 'action',
        render: (_, record) => (
            <Space size="middle">
                <a>Download</a>
            </Space>
        ),
    },
];
const data = [
    {
        key: '1',
        name:'Glioma DEGs:',
        age:'Download DE Results',

    },
    {
        key: '2',
        name:'Mouse RM3 DEGs:',
        age:'Download sn DE Results',

    },
    {
        key: '3',
        name:'',
        age:'Download Bulk DE Results',

    },
    {
        key: '4',
        name:'',
        age:'Download Raw Data',

    },
    {
        key: '5',
        name:'Human MR3 DEGs:',
        age:'Download DE Results',

    },
    {
        key: '6',
        name:'',
        age:'Download Raw Data',

    },
];
const DataSource=()=>{
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const [shouldRenderOtherComponents,setShouldRenderOtherComponents]=useState(false)
    const location = useLocation();
    useEffect(()=>{
        setShouldRenderOtherComponents(location.pathname.startsWith('/microScripts/dataSource'))
    },[location.pathname])

    return (

        <div>
            {shouldRenderOtherComponents && (
                // <Row>
                //     <Col span={24}>
                        <Table style={{ padding: '12px 36px',width:'1000px'}} pagination={false} showHeader={false} columns={columns} dataSource={data} />
                //     </Col>
                // </Row>
            )}
        </div>
    );
}
export default DataSource;