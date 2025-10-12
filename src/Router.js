import {createHashRouter, Navigate, RouterProvider} from "react-router-dom";
import Home from "./Home";
import MicroScripts from "./components/MicroScripts";
import MitoSurf from "./components/MitoSurf";
import MicroProteome from "./components/MiroProteome";
import MicroScriptsHome from "./components/MicroScripts/MicroScriptsHome";
import CrossSpeciesAnalysis from "./components/MicroScripts/CrossSpeciesAnalysis";
import DataSource from "./components/MicroScripts/DataSource";
import HumanBulkRNASeq from "./components/MicroScripts/HumanBulkRNASeq";
import MouseSnRNASeq from "./components/MicroScripts/MouseSnRNASeq";
import PopulationAnalysis from "./components/MicroScripts/PopulationAnalysis";

const BasicRoute = () => {

    const router=createHashRouter([
        {
            path:'/',
            element:<Home/>,
            children:[
                {
                    index: true,
                    element: <Navigate to="/microScripts/home" replace />,
                },
                {
                    path:'/microScripts',
                    element:<MicroScripts/>,
                    children: [
                        {
                            index: true,
                            element: <Navigate to="/microScripts/home" replace />,
                        },
                        {
                            path:'/microScripts/home',
                            element: <MicroScriptsHome/>,
                        },
                        {
                            path:'/microScripts/crossSpeciesAnalysis',
                            element: <CrossSpeciesAnalysis/>,
                        },
                        {
                            path:'/microScripts/dataSource',
                            element: <DataSource/>,
                        },
                        {
                            path:'/microScripts/humanBulkRNASeq',
                            element: <HumanBulkRNASeq/>,
                        },
                        {
                            path:'/microScripts/mouseSnRNASeq',
                            element: <MouseSnRNASeq/>,
                        },
                        {
                            path:'/microScripts/populationAnalysis',
                            element: <PopulationAnalysis/>,
                        }
                    ]
                },
                {
                    path:'/microProteome',
                    element:<MicroProteome/>,
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