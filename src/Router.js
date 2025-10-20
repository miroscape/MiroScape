import {createHashRouter, Navigate, RouterProvider} from "react-router-dom";
import Home from "./Home";
import MiroScripts from "./components/MiroScripts";
import MitoSurf from "./components/MitoSurf";
import MiroProteome from "./components/MiroProteome";
import MiroScriptsHome from "./components/MicroScripts/MiroScriptsHome";
import CrossSpeciesAnalysis from "./components/MicroScripts/CrossSpeciesAnalysis";
import DataSource from "./components/MicroScripts/DataSource";
import HumanBulkRNASeq from "./components/MicroScripts/HumanBulkRNASeq";
import MouseSnRNASeq from "./components/MicroScripts/MouseSnRNASeq";
import PopulationAnalysis from "./components/MicroScripts/PopulationAnalysis";
import Introduction from "./components/Introduction";
import FA from "./components/MiroProteome/FA";

const BasicRoute = () => {

    const router=createHashRouter([
        {
            path:'/',
            element:<Home/>,
            children:[
                {
                    index: true,
                    element: <Navigate to="/home" replace />,
                },
                {
                    path:'/home',
                    element:<Introduction/>,
                },
                {
                    path:'/miroScripts',
                    element:<MiroScripts/>,
                    children: [
                        {
                            index: true,
                            element: <Navigate to="/miroScripts/home" replace />,
                        },
                        {
                            path:'/miroScripts/home',
                            element: <MiroScriptsHome/>,
                        },
                        {
                            path:'/miroScripts/crossSpeciesAnalysis',
                            element: <CrossSpeciesAnalysis/>,
                        },
                        {
                            path:'/miroScripts/dataSource',
                            element: <DataSource/>,
                        },
                        {
                            path:'/miroScripts/humanBulkRNASeq',
                            element: <HumanBulkRNASeq/>,
                        },
                        {
                            path:'/miroScripts/mouseSnRNASeq',
                            element: <MouseSnRNASeq/>,
                        },
                        {
                            path:'/miroScripts/populationAnalysis',
                            element: <PopulationAnalysis/>,
                        }
                    ]
                },
                {
                    path:'/miroProteome',
                    element:<MiroProteome/>,
                    children: [
                        {
                            index: true,
                            element: <Navigate to="/miroProteome/FA" replace />,
                        },
                        {
                            path:'/miroProteome/FA',
                            element: <FA/>,
                        }
                    ]
                },
                {
                    path:'/mitoSurf',
                    element:<MitoSurf/>,
                },
            ]
        },

    ]);

    return (
        <RouterProvider router={router}/>
    );
};

export default BasicRoute;