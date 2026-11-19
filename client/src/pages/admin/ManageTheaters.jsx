import React, { useEffect, useState } from "react";
import { Building2, MapPin, Plus, Trash2 } from "lucide-react";
import Title from "../../components/admin/Title";
import Loading from "../../components/Loading";
import { apiRequest, formatCurrency } from "../../lib/api";
import { useAuthSession } from "../../lib/auth";
import toast from "react-hot-toast";

const ManageTheaters = () => {
  const { getToken } = useAuthSession();
  const [theaters, setTheaters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState("");
  const [city, setCity] = useState("Hyderabad");
  const [address, setAddress] = useState("");
  const [screenName, setScreenName] = useState("Screen 1 - Dolby Atmos");
  const [amenitiesText, setAmenitiesText] = useState(
    "Dolby Atmos, 4K Laser, Recliners"
  );
  const [silverPrice, setSilverPrice] = useState(180);
  const [goldPrice, setGoldPrice] = useState(250);
  const [reclinerPrice, setReclinerPrice] = useState(400);

  const fetchTheaters = async () => {
    setLoading(true);
    try {
      const res = await apiRequest("/api/admin/theaters", { getToken });
      setTheaters(res.theaters || []);
    } catch (err) {
      toast.error(err.message || "Could not load theaters");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTheaters();
  }, []);

  const handleCreateTheater = async (e) => {
    e.preventDefault();
    if (!name.trim() || !city.trim() || !address.trim()) {
      toast.error("Please fill in theater name, city, and address.");
      return;
    }

    setSubmitting(true);
    try {
      const amenities = amenitiesText
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean);

      const screens = [
        {
          name: screenName.trim() || "Screen 1",
          rows: ["A", "B", "C", "D", "E", "F", "G", "H"],
          seatsPerRow: 12,
          categories: [
            { name: "Silver", rows: ["A", "B", "C"], defaultPrice: Number(silverPrice) || 180 },
            { name: "Gold", rows: ["D", "E", "F"], defaultPrice: Number(goldPrice) || 250 },
            { name: "Recliner", rows: ["G", "H"], defaultPrice: Number(reclinerPrice) || 400 },
          ],
        },
      ];

      await apiRequest("/api/admin/theaters", {
        method: "POST",
        getToken,
        body: { name, city, address, amenities, screens },
      });

      toast.success(`Added theater "${name}"!`);
      setName("");
      setAddress("");
      fetchTheaters();
    } catch (err) {
      toast.error(err.message || "Failed to add theater");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTheater = async (theater) => {
    try {
      await apiRequest(`/api/admin/theaters/${theater._id}`, {
        method: "DELETE",
        getToken,
      });
      toast.success(`Removed "${theater.name}"`);
      fetchTheaters();
    } catch (err) {
      toast.error(err.message || "Failed to remove theater");
    }
  };

  return (
    <div className="pb-20 text-white max-w-5xl">
      <Title text1="Manage" text2="Theaters" />

      {/* Create Theater Form */}
      <form
        onSubmit={handleCreateTheater}
        className="mt-8 p-6 rounded-2xl bg-zinc-950 border border-white/10 space-y-5"
      >
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Plus className="w-5 h-5 text-primary" />
          Add New Theater & Screen Configuration
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Theater Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Asian Satyam Mall Cinemas"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1.5">City *</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Hyderabad"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-primary"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs text-gray-400 mb-1.5">Full Address *</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street, Area, Landmark"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Primary Screen Name</label>
            <input
              type="text"
              value={screenName}
              onChange={(e) => setScreenName(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1.5">
              Amenities (comma-separated)
            </label>
            <input
              type="text"
              value={amenitiesText}
              onChange={(e) => setAmenitiesText(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">
              Silver Default Price (Rows A–C)
            </label>
            <input
              type="number"
              min={50}
              value={silverPrice}
              onChange={(e) => setSilverPrice(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">
              Gold Default Price (Rows D–F)
            </label>
            <input
              type="number"
              min={50}
              value={goldPrice}
              onChange={(e) => setGoldPrice(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">
              Recliner Default Price (Rows G–H)
            </label>
            <input
              type="number"
              min={50}
              value={reclinerPrice}
              onChange={(e) => setReclinerPrice(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="px-8 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg font-semibold text-sm transition-colors cursor-pointer"
        >
          {submitting ? "Adding Theater..." : "Save Theater"}
        </button>
      </form>

      {/* Existing Theaters List */}
      <div className="mt-10">
        <h2 className="text-lg font-bold mb-4">
          Active Theaters ({theaters.length})
        </h2>

        {loading ? (
          <Loading />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {theaters.map((th) => (
              <div
                key={th._id}
                className="p-5 rounded-xl bg-zinc-950 border border-white/10 flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-bold text-base flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-primary shrink-0" />
                      {th.name}
                    </h3>
                    <button
                      type="button"
                      onClick={() => handleDeleteTheater(th)}
                      className="p-1.5 text-gray-500 hover:text-red-400 transition-colors cursor-pointer"
                      title="Remove theater"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                    {th.address} ({th.city})
                  </p>

                  <div className="mt-3 space-y-1.5">
                    {(th.screens || []).map((scr) => (
                      <div
                        key={scr.name}
                        className="text-xs bg-zinc-900 border border-white/10 rounded-lg p-2.5"
                      >
                        <p className="font-semibold text-white">{scr.name}</p>
                        <p className="text-gray-400 mt-0.5">
                          {(scr.categories || [])
                            .map((c) => `${c.name}: ${formatCurrency(c.defaultPrice)}`)
                            .join(" • ")}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageTheaters;
