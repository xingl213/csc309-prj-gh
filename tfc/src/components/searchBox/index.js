import React from "react";
import { Input } from "antd";
import { useMap } from 'react-map-gl';
const { Search } = Input;

const SearchBox = ({ OnSearch, coordinates }) => {

    const {baseMap} = useMap();

    const onClick = async (postal_code) => {
        console.log(postal_code);
        await OnSearch(postal_code);
        console.log(coordinates.longitude);
        baseMap.flyTo({center: [coordinates.longitude, coordinates.latitude]});
    };

    return (
        <div className='searchBox'>
            <Search placeholder="Postal code" onSearch={onClick} enterButton />
        </div>
    )
}

export default SearchBox;