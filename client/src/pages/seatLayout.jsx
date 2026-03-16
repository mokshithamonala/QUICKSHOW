import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { dummyShowsData, dummyDateTimeData } from '../assets/assets'
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'

const SeatLayout = () => {
  const { id, date } = useParams()
  const navigate = useNavigate()
  const [movie, setMovie] = useState(null)
  const [selectedSeats, setSelectedSeats] = useState([])
  const [occupiedSeats, setOccupiedSeats] = useState({})
  const [selectedShow, setSelectedShow] = useState(null)

  // Generate seat rows
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
  const seatsPerRow = 12

  const pricePerSeat = 250

  useEffect(() => {
    // Find movie from dummy data
    const foundMovie = dummyShowsData.find(m => m._id === id || m.id === parseInt(id))
    setMovie(foundMovie)

    // Get show for selected date
    if (dummyDateTimeData && dummyDateTimeData[date]) {
      const shows = dummyDateTimeData[date]
      if (shows.length > 0) {
        setSelectedShow(shows[0])
        setOccupiedSeats({})
      }
    }
  }, [id, date])

  const toggleSeat = (seatId) => {
    if (occupiedSeats[seatId]) {
      toast.error('This seat is already booked')
      return
    }

    setSelectedSeats(prev => 
      prev.includes(seatId)
        ? prev.filter(s => s !== seatId)
        : [...prev, seatId]
    )
  }

  const getSeatClass = (row, seatNum) => {
    const seatId = `${row}${seatNum}`
    const isOccupied = occupiedSeats[seatId]
    const isSelected = selectedSeats.includes(seatId)

    if (isOccupied) {
      return 'bg-zinc-700 cursor-not-allowed'
    }
    if (isSelected) {
      return 'bg-red-600 text-white'
    }
    return 'bg-zinc-900 hover:bg-zinc-700 text-gray-400'
  }

  const totalPrice = selectedSeats.length * pricePerSeat

  const handleBooking = () => {
    if (selectedSeats.length === 0) {
      toast.error('Please select at least one seat')
      return
    }
    toast.success(`Booking confirmed for ${selectedSeats.length} seats!`)
    // In a real app, this would navigate to payment or confirmation page
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white pt-20 px-6 md:px-16 pb-20">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back
      </button>

      <div className="max-w-4xl mx-auto">
        {/* Movie Info */}
        <div className="flex items-center gap-4 mb-8 p-4 bg-zinc-900/50 rounded-lg">
          <img
            src={movie.poster_path}
            alt={movie.title}
            className="w-16 h-24 object-cover rounded"
          />
          <div>
            <h1 className="text-xl font-bold">{movie.title}</h1>
            <p className="text-gray-400 text-sm">
              {new Date(date).toLocaleDateString('en-US', { 
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
              {selectedShow && ` • ${new Date(selectedShow.time).toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
              })}`}
            </p>
          </div>
        </div>

        {/* Screen */}
        <div className="mb-12">
          <div className="relative h-2 bg-gradient-to-r from-transparent via-red-600 to-transparent rounded-full mb-2">
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-gray-500 text-xs tracking-[1em]">
              SCREEN
            </div>
          </div>
          <div className="flex justify-center">
            <div className="w-3/4 h-16 bg-gradient-to-b from-red-600/20 to-transparent blur-xl rounded-t-full" />
          </div>
        </div>

        {/* Seats Legend */}
        <div className="flex justify-center gap-6 mb-8 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-zinc-900 rounded border border-zinc-700" />
            <span className="text-gray-400">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-red-600 rounded" />
            <span className="text-gray-400">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-zinc-700 rounded" />
            <span className="text-gray-400">Occupied</span>
          </div>
        </div>

        {/* Seat Layout */}
        <div className="flex flex-col items-center gap-2 mb-8">
          {rows.map((row, rowIndex) => (
            <div key={row} className="flex items-center gap-2">
              <span className="w-6 text-gray-500 text-sm">{row}</span>
              <div className="flex gap-1">
                {Array.from({ length: seatsPerRow }, (_, i) => i + 1).map((seatNum) => {
                  const seatId = `${row}${seatNum}`
                  return (
                    <button
                      key={seatId}
                      onClick={() => toggleSeat(seatId)}
                      disabled={occupiedSeats[seatId]}
                      className={`w-8 h-8 rounded text-xs font-medium transition-all ${getSeatClass(row, seatNum)}`}
                    >
                      {seatNum}
                    </button>
                  )
                })}
              </div>
              <span className="w-6 text-gray-500 text-sm text-right">{row}</span>
            </div>
          ))}
        </div>

        {/* Aisle Labels */}
        <div className="flex justify-center gap-2 mb-12 text-gray-600 text-xs">
          <div className="w-24" />
          <div className="w-8" />
          <div className="w-32" />
          <div className="w-8" />
          <div className="w-24" />
        </div>

        {/* Booking Summary */}
        <div className="bg-zinc-900 rounded-lg p-6">
          <h3 className="text-lg font-bold mb-4">Booking Summary</h3>
          
          <div className="flex justify-between mb-2">
            <span className="text-gray-400">Selected Seats</span>
            <span>{selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}</span>
          </div>
          
          <div className="flex justify-between mb-2">
            <span className="text-gray-400">Price per seat</span>
            <span>₹{pricePerSeat}</span>
          </div>
          
          <div className="flex justify-between mb-4">
            <span className="text-gray-400">Number of seats</span>
            <span>{selectedSeats.length}</span>
          </div>
          
          <div className="border-t border-zinc-800 pt-4 flex justify-between">
            <span className="font-bold">Total Amount</span>
            <span className="font-bold text-red-500 text-xl">₹{totalPrice}</span>
          </div>

          <button
            onClick={handleBooking}
            disabled={selectedSeats.length === 0}
            className={`w-full mt-6 py-4 rounded-lg font-bold text-lg transition-all ${
              selectedSeats.length > 0
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-zinc-800 text-gray-500 cursor-not-allowed'
            }`}
          >
            {selectedSeats.length > 0 ? 'Confirm Booking' : 'Select Seats to Continue'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default SeatLayout

