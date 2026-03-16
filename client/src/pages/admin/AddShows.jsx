import React, { useEffect, useState } from 'react'
import { dummyShowsData } from '../../assets/assets'
import Title from '../../components/Title'
import Loading from '../../components/Loading'
import { StarIcon, Check, X } from 'lucide-react'
import { kConverter } from '../../lib/kconverter'

const AddShows = () => {
    const currency = import.meta.env.VITE_CURRENCY || '$'
    const [nowPlayingMovies, setNowPlayingMovies] = useState([]);
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [dateTimeSelection, setDateTimeSelection] = useState({});
    const [dateTimeInput, setDateTimeInput] = useState("");
    const [showPrice, setShowPrice] = useState("");

    const fetchNowPlayingMovies = async () => {
        setNowPlayingMovies(dummyShowsData)
    };

    const handleDateTimeAdd = () => {
        if (!dateTimeInput) return;
        const [date, time] = dateTimeInput.split("T");
        if (!date || !time) return;

        setDateTimeSelection((prev) => {
            const times = prev[date] || [];
            if (!times.includes(time)) {
                return { ...prev, [date]: [...times, time] };
            }
            return prev;
        });
        setDateTimeInput("");
    };

    const removeTime = (date, timeToRemove) => {
        setDateTimeSelection(prev => {
            const updatedTimes = prev[date].filter(t => t !== timeToRemove);
            const updatedSelection = { ...prev };
            if (updatedTimes.length === 0) {
                delete updatedSelection[date];
            } else {
                updatedSelection[date] = updatedTimes;
            }
            return updatedSelection;
        });
    };

    const handleAddShow = () => {
        if(!selectedMovie || !showPrice || Object.keys(dateTimeSelection).length === 0) {
            alert("Please select a movie, price, and at least one show time.");
            return;
        }
        console.log("Submitting Show:", { selectedMovie, showPrice, dateTimeSelection });
    };

    useEffect(() => {
        fetchNowPlayingMovies();
    }, []);

    return nowPlayingMovies.length > 0 ? (
        <div className="pb-20 text-white">
            <Title text1="Add" text2="Shows" />
            
            <p className="mt-10 text-lg font-medium text-white">Now Playing Movies</p>
            <div className="overflow-x-auto pb-4">
                <div className="group flex flex-nowrap gap-4 mt-4 w-max">
                    {nowPlayingMovies.map((movie) => (
                        <div 
                            key={movie.id} 
                            onClick={() => setSelectedMovie(movie)}
                            className="w-40 sm:w-48 cursor-pointer transition-all duration-300"
                        >
                            <div className={`relative aspect-[2/3] w-full overflow-hidden rounded-lg border-2 transition-all ${selectedMovie?.id === movie.id ? 'border-red-600' : 'border-transparent'}`}>
                                <img 
                                    src={movie.poster_path} 
                                    alt={movie.title} 
                                    className={`w-full h-full object-cover brightness-90 transition-opacity ${selectedMovie && selectedMovie.id !== movie.id ? 'opacity-50' : 'opacity-100'}`} 
                                />
                                {selectedMovie?.id === movie.id && (
                                    <div className="absolute top-2 right-2 bg-red-600 rounded-sm p-0.5 z-10">
                                        <Check className="w-3 h-3 text-white stroke-[4px]" />
                                    </div>
                                )}
                                <div className="text-[10px] sm:text-xs flex items-center justify-between p-2 bg-black/80 w-full absolute bottom-0 left-0">
                                    <p className="flex items-center gap-1 text-gray-400">
                                        <StarIcon className="w-3 h-3 text-primary fill-primary" />
                                        {movie.vote_average.toFixed(1)}
                                    </p>
                                    <p className="text-gray-300">{kConverter(movie.vote_count)} Votes</p>
                                </div>
                            </div>
                            <div className="mt-2 text-white">
                                <p className="text-sm font-medium truncate w-full">{movie.title}</p>
                                <p className="text-xs text-gray-500">{movie.release_date}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-8">
                <label className="block text-sm font-medium mb-2 text-white">Show Price</label>
                <div className="inline-flex items-center gap-2 border border-gray-600 px-3 py-2 rounded-md bg-transparent">
                    <p className="text-gray-400 text-sm">{currency}</p>
                    <input 
                        min={0} type="number" value={showPrice} 
                        onChange={(e) => setShowPrice(e.target.value)} 
                        placeholder="Enter show price" 
                        className="bg-transparent outline-none text-white w-40 placeholder:text-gray-500" 
                    />
                </div>
            </div>

            <div className="mt-6">
                <label className="block text-sm font-medium mb-2 text-white">Select Date and Time</label>
                <div className="inline-flex gap-5 border border-gray-600 p-1 pl-3 rounded-lg bg-transparent">
                    <input 
                        type="datetime-local" value={dateTimeInput} 
                        onChange={(e) => setDateTimeInput(e.target.value)} 
                        className="bg-transparent outline-none text-white rounded-md cursor-pointer [color-scheme:dark]" 
                    />
                    <button 
                        onClick={handleDateTimeAdd} 
                        className="bg-red-600 text-white px-4 py-2 text-sm rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Add Time
                    </button>
                </div>
            </div>

            <div className="mt-10 space-y-6">
                <p className="text-lg font-medium text-white">Selected Date-Time</p>
                {Object.keys(dateTimeSelection).map(date => (
                    <div key={date} className="mt-4">
                        <p className="text-sm font-bold text-white mb-2">{date}</p>
                        <div className="flex flex-wrap gap-2">
                            {dateTimeSelection[date].map(time => (
                                <div 
                                    key={time} 
                                    className="flex items-center gap-2 bg-red-600/20 border border-red-600/50 text-white px-3 py-1 rounded-md text-sm"
                                >
                                    {time}
                                    <X 
                                        className="w-3 h-3 cursor-pointer hover:text-red-500 transition-colors" 
                                        onClick={() => removeTime(date, time)} 
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Fixed Button: Changed w-full to w-max with px-10 for the correct small look */}
            <button 
                onClick={handleAddShow}
                className="mt-12 w-max px-10 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded transition-all"
            >
                Add Show
            </button>
        </div>
    ) : <Loading />
}

export default AddShows