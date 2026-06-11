import React, { useState, useEffect, useRef } from 'react';
import { Clock, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from './Button';

interface TimePickerProps {
    value: string; // "HH:MM" (24h)
    onChange: (value: string) => void;
    label?: string;
}

export const TimePicker: React.FC<TimePickerProps> = ({ value, onChange, label }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [hour, setHour] = useState('12');
    const [minute, setMinute] = useState('00');
    const [period, setPeriod] = useState<'AM' | 'PM'>('AM');

    const containerRef = useRef<HTMLDivElement>(null);

    // Sync from props
    useEffect(() => {
        if (value) {
            const [h, m] = value.split(':');
            let hNum = parseInt(h);
            const mStr = m || '00';
            const p = hNum >= 12 ? 'PM' : 'AM';

            if (hNum > 12) hNum -= 12;
            if (hNum === 0) hNum = 12;

            setHour(hNum.toString().padStart(2, '0'));
            setMinute(mStr);
            setPeriod(p);
        }
    }, [value]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSave = () => {
        let hNum = parseInt(hour);
        if (isNaN(hNum)) hNum = 12;

        // Normalize 12h to 24h
        if (period === 'PM' && hNum !== 12) hNum += 12;
        if (period === 'AM' && hNum === 12) hNum = 0;

        const timeStr = `${hNum.toString().padStart(2, '0')}:${minute.padStart(2, '0')}`;
        onChange(timeStr);
        setIsOpen(false);
    };

    const handleHourChange = (val: string) => {
        // Allow digits only
        const clean = val.replace(/\D/g, '').slice(0, 2);
        setHour(clean);
        // Auto-validate logic could go here (e.g. if > 12)
    };

    const handleHourBlur = () => {
        let num = parseInt(hour || '12');
        if (num < 1) num = 1;
        if (num > 12) num = 12;
        setHour(num.toString().padStart(2, '0'));
    };

    const handleMinuteChange = (val: string) => {
        const clean = val.replace(/\D/g, '').slice(0, 2);
        setMinute(clean);
    };

    const handleMinuteBlur = () => {
        let num = parseInt(minute || '00');
        if (num < 0) num = 0;
        if (num > 59) num = 59;
        setMinute(num.toString().padStart(2, '0'));
    };

    const incrementHour = () => {
        let h = parseInt(hour);
        if (h === 12) h = 1;
        else h++;
        setHour(h.toString().padStart(2, '0'));
    };

    const decrementHour = () => {
        let h = parseInt(hour);
        if (h === 1) h = 12;
        else h--;
        setHour(h.toString().padStart(2, '0'));
    };

    const incrementMinute = () => {
        let m = parseInt(minute) + 1; // +1 minute usually better for flexibility
        if (m > 59) m = 0;
        setMinute(m.toString().padStart(2, '0'));
    };

    const decrementMinute = () => {
        let m = parseInt(minute) - 1;
        if (m < 0) m = 59;
        setMinute(m.toString().padStart(2, '0'));
    };



    return (
        <div className="relative" ref={containerRef}>
            {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}

            <div
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center w-full px-3 py-2 border border-gray-200 rounded-lg cursor-pointer hover:border-primary-500 bg-white shadow-sm"
            >
                <Clock className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-900 text-sm flex-1 font-medium">
                    {value ? (() => {
                        const [h, m] = value.split(':');
                        const hNum = parseInt(h);
                        const p = hNum >= 12 ? 'PM' : 'AM';
                        const h12 = hNum % 12 || 12;
                        return `${h12}:${m} ${p}`;
                    })() : <span className="text-gray-400">Select Time</span>}
                </span>
            </div>

            {isOpen && (
                <div className="absolute top-full mt-2 left-0 w-[240px] bg-white rounded-xl shadow-xl z-50 p-4 border border-gray-100 animate-in fade-in zoom-in-95 duration-100">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        {/* Hour Input */}
                        <div className="flex flex-col items-center">
                            <button type="button" onClick={incrementHour} className="p-1 text-gray-400 hover:text-primary-600 hover:bg-gray-50 rounded">
                                <ChevronUp className="h-5 w-5" />
                            </button>
                            <input
                                type="text"
                                value={hour}
                                onChange={e => handleHourChange(e.target.value)}
                                onBlur={handleHourBlur}
                                className="w-14 h-12 text-center text-2xl font-bold border rounded-lg focus:ring-2 focus:ring-primary-500 border-gray-200 text-gray-800"
                            />
                            <button type="button" onClick={decrementHour} className="p-1 text-gray-400 hover:text-primary-600 hover:bg-gray-50 rounded">
                                <ChevronDown className="h-5 w-5" />
                            </button>
                        </div>

                        <span className="text-2xl font-bold text-gray-300 pb-2">:</span>

                        {/* Minute Input */}
                        <div className="flex flex-col items-center">
                            <button type="button" onClick={incrementMinute} className="p-1 text-gray-400 hover:text-primary-600 hover:bg-gray-50 rounded">
                                <ChevronUp className="h-5 w-5" />
                            </button>
                            <input
                                type="text"
                                value={minute}
                                onChange={e => handleMinuteChange(e.target.value)}
                                onBlur={handleMinuteBlur}
                                className="w-14 h-12 text-center text-2xl font-bold border rounded-lg focus:ring-2 focus:ring-primary-500 border-gray-200 text-gray-800"
                            />
                            <button type="button" onClick={decrementMinute} className="p-1 text-gray-400 hover:text-primary-600 hover:bg-gray-50 rounded">
                                <ChevronDown className="h-5 w-5" />
                            </button>
                        </div>

                        {/* AM/PM Toggle */}
                        <div className="flex flex-col ml-2 gap-1">
                            <button
                                type="button"
                                onClick={() => setPeriod('AM')}
                                className={`px-2 py-1 text-xs font-bold rounded border ${period === 'AM' ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                            >
                                AM
                            </button>
                            <button
                                type="button"
                                onClick={() => setPeriod('PM')}
                                className={`px-2 py-1 text-xs font-bold rounded border ${period === 'PM' ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                            >
                                PM
                            </button>
                        </div>
                    </div>

                    <div className="w-full">
                        <Button onClick={handleSave} size="sm" className="w-full">
                            Confirm Time
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};
