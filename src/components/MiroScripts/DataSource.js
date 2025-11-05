import React from 'react';
// import {HomeOutlined} from '@ant-design/icons';
import {Breadcrumb, Button, Col, Flex, Layout, Menu, Row, Space, Table, theme} from "antd";
import {useEffect, useState} from "react";
import {Outlet, useLocation, useNavigate} from "react-router-dom";
import {RiBrainLine, RiDatabaseLine, RiEarthLine, RiHome5Line, RiMickeyLine, RiTeamLine} from "@remixicon/react";
// import Sider from "antd/es/layout/Sider";
const {Header, Content ,Sider} = Layout;

const handleDownload = (filename) => {
    const link = document.createElement('a');
    link.href = `${process.env.PUBLIC_URL}/data/${filename}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

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
                {record.downloadable ? (
                    <a onClick={() => handleDownload(record.filename)}>Download</a>
                ) : (
                    <span style={{ color: '#999' }}>Download</span>
                )}
            </Space>
        ),
    },
];

const data = [
    {
        key: '1',
        name:'Glioma DEGs:',
        age:'Download DE Results',
        downloadable: true,
        filename: 'TCGA_GBM_vs_Brain.csv'
    },
    {
        key: '2',
        name:'Mouse RM3 DEGs:',
        age:'Download sn DE Results',
        downloadable: true,
        filename: 'mouse_sn_DE.csv'
    },
    {
        key: '3',
        name:'',
        age:'Download Bulk DE Results',
        downloadable: true,
        filename: 'mouse_pseudobulk_de_results.csv'
    },
    {
        key: '4',
        name:'',
        age:'Download Raw Data',
        downloadable: false,
        filename: ''
    },
    {
        key: '5',
        name:'Human MR3 DEGs:',
        age:'Download DE Results',
        downloadable: true,
        filename: 'deseq2_results_with_plain.csv'
    },
    {
        key: '6',
        name:'',
        age:'Download Raw Data',
        downloadable: false,
        filename: ''
    },
];

const DataSource=()=>{
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const [shouldRenderOtherComponents,setShouldRenderOtherComponents]=useState(false)
    const location = useLocation();
    useEffect(()=>{
        setShouldRenderOtherComponents(location.pathname.startsWith('/miroScripts/dataSource'))
    },[location.pathname])

    return (

        <div>
            {shouldRenderOtherComponents && (
                <>
                    <Table style={{ padding: '12px 36px',width:'1000px'}} pagination={false} showHeader={false} columns={columns} dataSource={data} />
                    <div style={{ 
                        padding: '24px 36px', 
                        fontSize: '14px', 
                        color: '#666',
                        lineHeight: '1.6'
                    }}>
                        <strong>Acknowledgement:</strong><br/> Population analysis in this study is adapted from GEPIA3 (Yu-Jian Kang, Lingjie Pan, Yiyu Liu, Zhengqin Rong, Jiaxi Liu, Fenglin Liu. GEPIA3: Enhanced drug sensitivity and interaction network analysis for cancer research. Nucleic Acids Research, 2025 May 21; gkaf423. doi: 10.1093/nar/gkaf423).
                    </div>
                </>
            )}
        </div>
    );
}
export default DataSource;