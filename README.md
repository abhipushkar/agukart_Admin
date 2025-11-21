# Agukart - Handicrafts & Jewelry E-commerce App

Agukart is a modern e-commerce platform specializing in authentic handicrafts and exquisite jewelry made from various stones and materials. Built with React and Material-UI, this application provides a seamless shopping experience for customers seeking unique, handcrafted items.

![Agukart Banner](https://ui-lib.com/blog/wp-content/uploads/2021/09/matx-github.png)
ss 
## 🎯 About Agukart

Agukart brings together traditional craftsmanship and modern e-commerce technology. Our platform showcases a diverse collection of:
- **Handcrafted Jewelry** featuring precious stones, beads, and metals
- **Artisanal Handicrafts** from skilled craftspeople
- **Traditional Artworks** preserving cultural heritage
- **Custom-made Pieces** for personalized shopping experiences

## ✨ Features

### 🛍️ E-commerce Capabilities
- **Product Catalog** with advanced filtering
- **Shopping Cart & Wishlist** functionality
- **Secure Checkout Process**
- **Order Tracking & History**
- **Customer Reviews & Ratings**
- **Product Recommendations**

### 🔐 Authentication & Security
- JWT authentication system
- Role-based access control
- Secure payment processing
- User profile management

### 🎨 User Experience
- **Material Design** components
- **Responsive Design** for all devices
- **Fast Loading** with lazy loading components
- **Intuitive Navigation** with multi-level menus
- **Dark/Light Theme** options

### 📱 Admin Features
- **Dashboard Analytics** with sales insights
- **Product Management** (add, edit, delete)
- **Inventory Tracking**
- **Order Management**
- **Customer Management**
- **Sales Reports**

## 🚀 Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/agukart-ecommerce.git
   cd agukart-ecommerce
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**
   ```bash
   npm start
   # or
   yarn start
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000) to view the application.

### Building for Production

```bash
npm run build
# or
yarn build
```

This creates a `build` folder with optimized production files ready for deployment.

## 🏗️ Project Structure

```
agukart-ecommerce/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Main application pages
│   ├── store/         # Redux store configuration
│   ├── routes/        # Application routing
│   ├── utils/         # Helper functions
│   └── assets/        # Images, icons, and static files
├── public/            # Public assets
└── package.json       # Project dependencies
```

## 🛠️ Technology Stack

- **Frontend Framework**: React 18+
- **UI Library**: Material-UI (MUI)
- **State Management**: Redux Toolkit
- **Routing**: React Router
- **HTTP Client**: Axios
- **Charts**: React ApexCharts
- **Forms**: React Hook Form
- **Icons**: Material Icons

## 📦 Key Dependencies

```json
  {
    "@auth0/auth0-spa-js": "^2.1.3",
    "@emotion/react": "^11.13.5",
    "@emotion/styled": "^11.13.5",
    "@material-ui/core": "^4.12.4",
    "@mui/icons-material": "^5.15.18",
    "@mui/joy": "^5.0.0-beta.36",
    "@mui/lab": "^5.0.0-alpha.165",
    "@mui/material": "^5.16.8",
    "@mui/x-data-grid": "^7.6.1",
    "@mui/x-date-pickers": "^6.20.2",
    "@mui/x-date-pickers-pro": "^7.7.1",
    "@reduxjs/toolkit": "^2.2.1",
    "@syncfusion/ej2-base": "^29.2.4",
    "@syncfusion/ej2-react-richtexteditor": "^29.2.4",
    "ajv": "^8.16.0",
    "ajv-keywords": "^5.1.0",
    "autosuggest-highlight": "^3.3.4",
    "axios": "^1.6.7",
    "caniuse-lite": "^1.0.30001717",
    "ckeditor4-react": "^5.2.1",
    "clsx": "^2.1.0",
    "cropperjs": "^1.6.2",
    "datatables.net-dt": "^1.13.11",
    "date-fns": "^3.3.1",
    "dayjs": "^1.11.13",
    "echarts": "^5.4.3",
    "echarts-for-react": "^3.0.2",
    "firebase": "^10.13.2",
    "formik": "^2.4.5",
    "highcharts": "^11.4.3",
    "highcharts-react-official": "^3.2.1",
    "html-react-parser": "^5.1.12",
    "html2canvas": "^1.4.1",
    "jspdf": "^2.5.2",
    "loadash": "^1.0.0",
    "lodash": "^4.17.21",
    "lodash.debounce": "^4.0.8",
    "material-ui-nested-menu-item": "^1.0.2",
    "moment": "^2.30.1",
    "mui-file-input": "^4.0.4",
    "mui-nested-menu": "^3.4.0",
    "notistack": "^3.0.1",
    "prop-types": "^15.8.1",
    "quill-image-resize-module-react": "^3.0.0",
    "react": "^18.2.0",
    "react-beautiful-dnd": "^13.1.1",
    "react-cropper": "^2.3.3",
    "react-dnd": "^16.0.1",
    "react-dnd-html5-backend": "^16.0.1",
    "react-dom": "^18.2.0",
    "react-easy-crop": "^5.5.2",
    "react-grid-layout": "^1.4.4",
    "react-material-ui-form-validator": "^3.0.1",
    "react-perfect-scrollbar": "^1.5.8",
    "react-phone-input-2": "^2.15.1",
    "react-quill": "^2.0.0",
    "react-redux": "^9.1.0",
    "react-router-dom": "^6.22.0",
    "react-scripts": "^5.0.1",
    "react-table": "^7.8.0",
    "react-to-print": "^3.0.1",
    "react-toastify": "^10.0.5",
    "react-zoom-pan-pinch": "^3.7.0",
    "shortid": "^2.2.16",
    "uuid": "^10.0.0",
    "xlsx": "^0.18.5",
    "yup": "^1.3.3",
    "zustand": "^5.0.8"
  }
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
REACT_APP_API_URL=your_api_url
REACT_APP_STRIPE_PUBLISHABLE_KEY=your_stripe_key
REACT_APP_GOOGLE_ANALYTICS_ID=your_ga_id
```

## 🎨 Customization

### Theming
Modify the theme in `src/theme/` to match Agukart's brand colors:

```javascript
const agukartTheme = createTheme({
  palette: {
    primary: {
      main: '#your-brand-color',
    },
    secondary: {
      main: '#your-accent-color',
    },
  },
});
```

### Adding New Products
Update the product configuration in `src/data/` to include new categories and product types.

## 🤝 Contributing

We welcome contributions to improve Agukart! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 🆘 Support

For technical support or questions about Agukart:
- 📧 Email: [support@agukart.com](mailto:support@agukart.com)
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/agukart-ecommerce/issues)
- 📚 Documentation: [Agukart Docs](https://docs.agukart.com)

## 🙏 Acknowledgments

- Built using [MatX React Template](https://ui-lib.com/downloads/matx-react-dashboard/)
- Material-UI components and design system
- React community for excellent tools and libraries

---

**Agukart** - Where Tradition Meets Modern E-commerce 🛍️✨
