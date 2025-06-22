import React, {useState, useEffect} from "react";
import "./ReservationsPage.css";

const ReservationsPage = () => {
    const [formData, setFormData] = useState({
        rental_date: "",
        return_date: "",
        total_price: "",
        insurance_option_id: "",
    });
    const [reservations, setReservations] = useState([]);

    useEffect(() => {
        const load = () => {
            const data = JSON.parse(localStorage.getItem('reservations') || '[]');
            setReservations(data);
        };
        load();
        window.addEventListener('storageChange', load);
        return () => window.removeEventListener('storageChange', load);
    }, []);

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("폼 제출:", formData);
    };

    return (
        <div className="Reservation-Container">
            <h2>예약하기</h2>
            <form onSubmit={handleSubmit}>
                <label>
                    Recommendation ID:
                    <input
                        type="number"
                        name="recommendation_id"
                        value={formData.recommendation_id}
                        onChange={handleChange}
                        required
                    />
                </label>
                <br/>
                <br/>
                <label>
                    Rental Date:
                    <input
                        type="date"
                        name="rental_date"
                        value={formData.rental_date}
                        onChange={handleChange}
                        required
                    />
                </label>
                <br/>
                <label>
                    Return Date:
                    <input
                        type="date"
                        name="return_date"
                        value={formData.return_date}
                        onChange={handleChange}
                        required
                    />
                </label>
                <br/>
                <label>
                    Total Price:
                    <input
                        type="number"
                        step="0.01"
                        name="total_price"
                        value={formData.total_price}
                        onChange={handleChange}
                        required
                    />
                </label>
                <br/>
                <label>
                    Insurance Option ID:
                    <input
                        type="number"
                        name="insurance_option_id"
                        value={formData.insurance_option_id}
                        onChange={handleChange}
                        required
                    />
                </label>
                <br/>
                <button type="submit">예약하기</button>
            </form>
        </div>
    );
};

export default ReservationsPage;
