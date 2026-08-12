"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const customers_routes_1 = __importDefault(require("./routes/customers.routes"));
const products_routes_1 = __importDefault(require("./routes/products.routes"));
const challans_routes_1 = __importDefault(require("./routes/challans.routes"));
const invoices_routes_1 = __importDefault(require("./routes/invoices.routes"));
const payments_routes_1 = __importDefault(require("./routes/payments.routes"));
const settings_routes_1 = __importDefault(require("./routes/settings.routes"));
const analytics_routes_1 = __importDefault(require("./routes/analytics.routes"));
const edit_requests_routes_1 = __importDefault(require("./routes/edit-requests.routes"));
const users_routes_1 = __importDefault(require("./routes/users.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/customers', customers_routes_1.default);
app.use('/api/products', products_routes_1.default);
app.use('/api/challans', challans_routes_1.default);
app.use('/api/invoices', invoices_routes_1.default);
app.use('/api/payments', payments_routes_1.default);
app.use('/api/settings', settings_routes_1.default);
app.use('/api/analytics', analytics_routes_1.default);
app.use('/api/edit-requests', edit_requests_routes_1.default);
app.use('/api/users', users_routes_1.default);
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK' });
});
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
