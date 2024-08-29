'use client'

import React, { useState } from 'react'

type Direction = string;
const directionLabels: Record<Direction, string> = {
    nw: 'north_west',
    n: 'north',
    ne: 'north_east',
    w: 'west',
    center: 'center',
    e: 'east',
    sw: 'south_west',
    s: 'south',
    se: 'south_east',
};

export default function Component() {
    const [selectedDirection, setSelectedDirection] = useState<Direction>('npne')

    const handleSelectDirection = (direction: Direction) => {
        setSelectedDirection(direction)
    }

    const renderDot = (direction: Direction) => {
        const isSelected = selectedDirection === direction
        return (
            <button
                className={[
                    "w-2 h-2 rounded-full",
                    isSelected ? "bg-blue-500" : "bg-gray-300",
                    "hover:bg-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                ].join(" ")}
                onClick={() => handleSelectDirection(direction)}
                aria-label={`Select ${directionLabels[direction]}`}
                aria-pressed={isSelected}
            />
        )
    }

    return (
        <div className="flex flex-col items-center space-y-4">
            <div className="grid grid-cols-3 gap-4 p-4 bg-white border border-gray-200 rounded-md shadow-sm w-24 h-24">
                {renderDot('nw')}
                {renderDot('n')}
                {renderDot('ne')}
                {renderDot('w')}
                {renderDot('center')}
                {renderDot('e')}
                {renderDot('sw')}
                {renderDot('s')}
                {renderDot('se')}
            </div>
        </div>
    )
}