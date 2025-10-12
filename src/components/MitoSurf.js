
import {Layout, theme} from "antd";
import {useEffect, useState} from "react";
import {Outlet, useLocation} from "react-router-dom";
const { Header, Content } = Layout;

const MitoSurf=()=>{
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();
    const [shouldRenderOtherComponents,setShouldRenderOtherComponents]=useState(false)
    const location = useLocation();
    useEffect(()=>{
        setShouldRenderOtherComponents(location.pathname === '/mitoSurf')
    },[location.pathname])

    return (

        <div>
            {shouldRenderOtherComponents && (
                <Content style={{ padding: '24px 48px' }}>
                    <div
                        style={{
                            background: colorBgContainer,
                            minHeight: 280,
                            padding: 24,
                            borderRadius: borderRadiusLG,
                        }}
                    >
                        MitoSurf
                    </div>
                </Content>
            )}
            <Outlet/>
        </div>
    );
}
export default MitoSurf;