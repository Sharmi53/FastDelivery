import React, { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Users,
  Truck,
  DollarSign,
  ShieldCheck,
  LogOut,
  ArrowLeft,
  Image as ImageIcon,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Plus
} from 'lucide-react';

const API_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'https://fastdelivery-x0ce.onrender.com/api';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [activeTab, setActiveTab] = useState('dashboard');
  // =====================================
  // PRODUCT MANAGEMENT STATES
  // =====================================
  const [products, setProducts] = useState([]);

  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productOriginalPrice, setProductOriginalPrice] = useState('');
  const [productStock, setProductStock] = useState('');
  const [productImage, setProductImage] = useState('');
  const [productImageFile, setProductImageFile] = useState(null);
  const [productImagePreview, setProductImagePreview] = useState('');
  const [imageUploading, setImageUploading] = useState(false);
  // =====================================
  // CATEGORY MANAGEMENT STATES
  // =====================================
  const [categories, setCategories] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categoryError, setCategoryError] = useState('');
  // =====================================
  // DASHBOARD STATISTICS STATES (CURRENT MONTH)
  // =====================================
  const [dashboardStatsData, setDashboardStatsData] = useState({
    month: '',
    orders: 0,
    revenue: 0
  });
  const [dashboardStatsLoading, setDashboardStatsLoading] = useState(false);
  const [dashboardStatsError, setDashboardStatsError] = useState('');

  // =====================================
  // ORDER MANAGEMENT STATES
  // =====================================
  const [orders, setOrders] = useState([]);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  // =====================================
  // DELIVERY PARTNER STATES (for order assignment dropdown)
  // =====================================
  const [deliveryPartners, setDeliveryPartners] = useState([]);
  const [loadingDeliveryPartners, setLoadingDeliveryPartners] = useState(false);
  const [assigningOrderId, setAssigningOrderId] = useState(null);
  // Selected order details
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrderItems, setSelectedOrderItems] = useState([]);
  const [orderDetailsLoading, setOrderDetailsLoading] = useState(false);

  // =====================================
  // DELIVERY PARTNER MANAGEMENT STATES
  // =====================================
  const [dpList, setDpList] = useState([]);
  const [dpLoading, setDpLoading] = useState(false);
  const [dpError, setDpError] = useState('');
  const [showDpForm, setShowDpForm] = useState(false);
  const [editingDp, setEditingDp] = useState(null);
  const [dpSaving, setDpSaving] = useState(false);
  // Form fields
  const [dpName, setDpName] = useState('');
  const [dpEmail, setDpEmail] = useState('');
  const [dpPhone, setDpPhone] = useState('');
  const [dpPassword, setDpPassword] = useState('');
  const [dpVehicleType, setDpVehicleType] = useState('motorcycle');
  const [dpVehicleNumber, setDpVehicleNumber] = useState('');
  const [dpStatus, setDpStatus] = useState('active');

  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [categoryImage, setCategoryImage] = useState('');
  const [categoryImageFile, setCategoryImageFile] = useState(null);
  const [categoryImagePreview, setCategoryImagePreview] = useState('');
  const [categoryImageUploading, setCategoryImageUploading] = useState(false);
  const [categoryStatus, setCategoryStatus] = useState('active');
  const [categorySaving, setCategorySaving] = useState(false);

  // =====================================
  // BANNER MANAGEMENT STATES
  // =====================================
  const [banners, setBanners] = useState([]);
  const [bannerLoading, setBannerLoading] = useState(false);
  const [bannerError, setBannerError] = useState('');
  const [bannerSuccess, setBannerSuccess] = useState('');
  const [showBannerForm, setShowBannerForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerDescription, setBannerDescription] = useState('');
  const [bannerButtonText, setBannerButtonText] = useState('Shop Now');
  const [bannerLinkUrl, setBannerLinkUrl] = useState('/products');
  const [bannerImage, setBannerImage] = useState('');
  const [bannerCloudinaryId, setBannerCloudinaryId] = useState('');
  const [bannerImageFile, setBannerImageFile] = useState(null);
  const [bannerImagePreview, setBannerImagePreview] = useState('');
  const [bannerImageUploading, setBannerImageUploading] = useState(false);
  const [bannerStatus, setBannerStatus] = useState('active');
  const [bannerDisplayOrder, setBannerDisplayOrder] = useState(1);
  const [bannerSaving, setBannerSaving] = useState(false);

  // =====================================
  // RESTORE ADMIN LOGIN AFTER REFRESH
  // =====================================
  useEffect(() => {
    const validateAdminToken = async () => {
      const savedUser = localStorage.getItem('grocery_admin_user');

      if (!savedUser) {
        return;
      }

      try {
        const userData = JSON.parse(savedUser);

        if (
          userData.role !== 'admin' ||
          !userData.token
        ) {
          localStorage.removeItem('grocery_admin_user');
          return;
        }

        const response = await fetch(`${API_URL}/auth/me`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${userData.token}`
            }
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          localStorage.removeItem('grocery_admin_user');
          setIsAuthenticated(false);
          return;
        }

        if (data.user.role !== 'admin') {
          localStorage.removeItem('grocery_admin_user');
          setIsAuthenticated(false);
          return;
        }

        const updatedUser = {
          ...userData,
          ...data.user,
          token: userData.token
        };

        localStorage.setItem(
          'grocery_admin_user',
          JSON.stringify(updatedUser)
        );

        setIsAuthenticated(true);

      } catch (error) {
        console.error(
          'Admin token validation failed:',
          error
        );

        localStorage.removeItem('grocery_admin_user');
        setIsAuthenticated(false);
      }
    };

    validateAdminToken();
  }, []);
  // =====================================
  // LOAD CATEGORIES WHEN TAB OPENS
  // =====================================
  // =====================================
  // LOAD CATEGORIES WHEN NEEDED
  // =====================================
  useEffect(() => {
    if (!isAuthenticated) return;

    if (
      activeTab === 'categories' ||
      activeTab === 'products'
    ) {
      loadCategories();
    }

    if (activeTab === 'products') {
      loadProducts();
    }

    if (activeTab === 'dashboard') {
      loadDashboardStats();
    }

    if (
      activeTab === 'orders' ||
      activeTab === 'dashboard'
    ) {
      loadOrders();
      loadDeliveryPartners();
    }

    if (activeTab === 'deliveryPartners') {
      loadDpList();
    }

    if (activeTab === 'banners') {
      loadBanners();
    }
  }, [isAuthenticated, activeTab]);
  // =====================================
  // ADMIN LOGIN
  // =====================================
  const handleLogin = async (e) => {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password,
          role: 'admin'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }


      // Make sure this account is actually an admin
      if (data.user.role !== 'admin') {
        throw new Error('This account does not have admin access.');
      }


      // Save admin information and JWT
      localStorage.setItem(
        'grocery_admin_user',
        JSON.stringify({
          ...data.user,
          token: data.token
        })
      );


      setIsAuthenticated(true);

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };


  // =====================================
  // ADMIN LOGOUT
  // =====================================
  // =====================================
  // GET ADMIN TOKEN
  // =====================================
  // =====================================
  // LOAD ALL ORDERS
  // =====================================
  const loadOrders = async () => {
    try {
      setOrderLoading(true);
      setOrderError('');

      const token = getAdminToken();

      const response = await fetch(`${API_URL}/orders/admin/all`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      console.log('Admin orders response:', data);

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to load orders');
      }

      setOrders(data.orders || []);
    } catch (error) {
      console.error('Load orders error:', error);
      setOrderError(error.message);
    } finally {
      setOrderLoading(false);
    }
  };

  // =====================================
  // LOAD DASHBOARD STATS (CURRENT MONTH)
  // =====================================
  const loadDashboardStats = async () => {
    try {
      setDashboardStatsLoading(true);
      setDashboardStatsError('');

      const token = getAdminToken();
      if (!token) return;

      const response = await fetch(`${API_URL}/admin/dashboard/stats`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to load dashboard statistics');
      }

      setDashboardStatsData({
        month: data.month || '',
        orders: Number(data.orders || 0),
        revenue: Number(data.revenue || 0)
      });
    } catch (error) {
      console.error('Load dashboard stats error:', error);
      setDashboardStatsError(error.message);
    } finally {
      setDashboardStatsLoading(false);
    }
  };

  // =====================================
  // LOAD ORDER DETAILS WITH ITEMS
  // =====================================
  const loadOrderDetails = async (orderId) => {
    try {
      setOrderDetailsLoading(true);
      setOrderError('');

      const token = getAdminToken();

      const response = await fetch(
        `${API_URL}/orders/admin/${orderId}/details`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || 'Failed to load order details'
        );
      }

      setSelectedOrder(data.order);
      setSelectedOrderItems(data.items || []);

    } catch (error) {
      console.error(
        'Load order details error:',
        error
      );

      setOrderError(error.message);
    } finally {
      setOrderDetailsLoading(false);
    }
  };
  // =====================================
  // UPDATE ORDER STATUS
  // =====================================
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      setUpdatingOrderId(orderId);
      setOrderError('');

      const token = getAdminToken();

      const response = await fetch(
        `${API_URL}/orders/admin/${orderId}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            status: newStatus
          })
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to update order status');
      }

      alert('Order status updated successfully.');

      await loadOrders();
      await loadDashboardStats();
    } catch (error) {
      console.error('Update order status error:', error);
      setOrderError(error.message);
    } finally {
      setUpdatingOrderId(null);
    }
  };
  const getAdminToken = () => {
    const savedUser = localStorage.getItem('grocery_admin_user');

    if (!savedUser) {
      return null;
    }

    const userData = JSON.parse(savedUser);
    return userData.token;
  };
  // =====================================
  // LOAD DELIVERY PARTNERS
  // =====================================
  const loadDeliveryPartners = async () => {
    try {
      setLoadingDeliveryPartners(true);

      const token = getAdminToken();

      const response = await fetch(
        `${API_URL}/orders/admin/delivery-partners`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();

      console.log(
        'Delivery partners response:',
        data
      );

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
          'Failed to load delivery partners'
        );
      }

      setDeliveryPartners(
        data.deliveryPartners || []
      );

    } catch (error) {
      console.error(
        'Load delivery partners error:',
        error
      );

      setOrderError(error.message);

    } finally {
      setLoadingDeliveryPartners(false);
    }
  };
  // =====================================
  // DELIVERY PARTNER MANAGEMENT FUNCTIONS
  // =====================================
  const loadDpList = async () => {
    try {
      setDpLoading(true);
      setDpError('');
      const token = getAdminToken();
      const response = await fetch(`${API_URL}/auth/admin/delivery-partners`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to load delivery partners');
      }
      setDpList(data.deliveryPartners || []);
    } catch (error) {
      console.error('Load dp list error:', error);
      setDpError(error.message);
    } finally {
      setDpLoading(false);
    }
  };

  const resetDpForm = () => {
    setEditingDp(null);
    setDpName('');
    setDpEmail('');
    setDpPhone('');
    setDpPassword('');
    setDpVehicleType('motorcycle');
    setDpVehicleNumber('');
    setDpStatus('active');
    setShowDpForm(false);
    setDpError('');
  };

  const openAddDpForm = () => {
    resetDpForm();
    setShowDpForm(true);
  };

  const openEditDpForm = (dp) => {
    setEditingDp(dp);
    setDpName(dp.name || '');
    setDpEmail(dp.email || '');
    setDpPhone(dp.phone || '');
    setDpPassword('');
    setDpVehicleType(dp.vehicle_type || 'motorcycle');
    setDpVehicleNumber(dp.vehicle_number || '');
    setDpStatus(dp.status || 'active');
    setDpError('');
    setShowDpForm(true);
  };

  const handleDpSubmit = async (e) => {
    e.preventDefault();
    setDpSaving(true);
    setDpError('');
    try {
      const token = getAdminToken();
      const payload = {
        name: dpName.trim(),
        email: dpEmail.trim(),
        phone: dpPhone.trim(),
        vehicle_type: dpVehicleType,
        vehicle_number: dpVehicleNumber.trim() || null,
        status: dpStatus
      };
      if (!editingDp) {
        payload.password = dpPassword;
      } else if (dpPassword.trim() !== '') {
        payload.password = dpPassword;
      }

      const url = editingDp
        ? `${API_URL}/auth/admin/delivery-partners/${editingDp.id}`
        : `${API_URL}/auth/admin/delivery-partners`;
      const method = editingDp ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to save delivery partner');
      }
      alert(editingDp ? 'Delivery partner updated successfully!' : 'Delivery partner created successfully!');
      resetDpForm();
      loadDpList();
    } catch (error) {
      console.error('Save dp error:', error);
      setDpError(error.message);
    } finally {
      setDpSaving(false);
    }
  };

  const handleDeleteDp = async (dpId) => {
    const confirmed = window.confirm(
      'Are you sure you want to permanently delete this delivery partner? This action cannot be undone.'
    );
    if (!confirmed) return;
    try {
      const token = getAdminToken();
      const response = await fetch(
        `${API_URL}/auth/admin/delivery-partners/${dpId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete delivery partner');
      }
      alert('Delivery partner permanently deleted.');
      loadDpList();
    } catch (error) {
      console.error('Delete dp error:', error);
      setDpError(error.message);
    }
  };
  // =====================================
  // ASSIGN DELIVERY PARTNER
  // =====================================
  const handleAssignDeliveryPartner = async (
    orderId,
    deliveryPartnerId
  ) => {
    if (!deliveryPartnerId) {
      return;
    }

    try {
      setAssigningOrderId(orderId);
      setOrderError('');

      const token = getAdminToken();

      const response = await fetch(
        `${API_URL}/orders/admin/${orderId}/assign`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            deliveryPartnerId:
              Number(deliveryPartnerId)
          })
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
          'Failed to assign delivery partner'
        );
      }

      alert(
        'Delivery partner assigned successfully.'
      );

      await loadOrders();
      await loadDashboardStats();

    } catch (error) {
      console.error(
        'Assign delivery partner error:',
        error
      );

      setOrderError(error.message);

    } finally {
      setAssigningOrderId(null);
    }
  };
  // =====================================
  // LOAD ALL CATEGORIES
  // =====================================
  const loadCategories = async () => {
    setCategoryLoading(true);
    setCategoryError('');

    try {
      const token = getAdminToken();

      const response = await fetch(`${API_URL}/categories/all`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to load categories');
      }

      setCategories(data.categories || []);

    } catch (error) {
      console.error('Load categories error:', error);
      setCategoryError(error.message);
    } finally {
      setCategoryLoading(false);
    }
  };


  // =====================================
  // RESET CATEGORY FORM
  // =====================================
  const resetCategoryForm = () => {
    if (categoryImagePreview && categoryImagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(categoryImagePreview);
    }
    setCategoryName('');
    setCategoryDescription('');
    setCategoryImage('');
    setCategoryImageFile(null);
    setCategoryImagePreview('');
    setCategoryImageUploading(false);
    setCategoryStatus('active');
    setEditingCategory(null);
    setShowCategoryForm(false);
    const fileInput = document.getElementById('category-image-file-input');
    if (fileInput) fileInput.value = '';
  };


  // =====================================
  // OPEN ADD CATEGORY FORM
  // =====================================
  const openAddCategoryForm = () => {
    if (categoryImagePreview && categoryImagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(categoryImagePreview);
    }
    setEditingCategory(null);
    setCategoryName('');
    setCategoryDescription('');
    setCategoryImage('');
    setCategoryImageFile(null);
    setCategoryImagePreview('');
    setCategoryImageUploading(false);
    setCategoryStatus('active');
    setCategoryError('');
    setShowCategoryForm(true);
    const fileInput = document.getElementById('category-image-file-input');
    if (fileInput) fileInput.value = '';
  };


  // =====================================
  // OPEN EDIT CATEGORY FORM
  // =====================================
  const openEditCategoryForm = (category) => {
    if (categoryImagePreview && categoryImagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(categoryImagePreview);
    }
    setEditingCategory(category);
    setCategoryName(category.name || '');
    setCategoryDescription(category.description || '');
    setCategoryImage(category.image || '');
    setCategoryImageFile(null);
    setCategoryImagePreview(category.image || '');
    setCategoryImageUploading(false);
    setCategoryStatus(category.status || 'active');
    setCategoryError('');
    setShowCategoryForm(true);
    const fileInput = document.getElementById('category-image-file-input');
    if (fileInput) fileInput.value = '';
  };


  // =====================================
  // CATEGORY IMAGE HANDLERS
  // =====================================
  const handleCategoryImageFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Please select a valid image file (JPG, JPEG, PNG, or WEBP).');
      e.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image file size must be less than 5MB.');
      e.target.value = '';
      return;
    }

    if (categoryImagePreview && categoryImagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(categoryImagePreview);
    }

    setCategoryImageFile(file);
    const previewUrl = URL.createObjectURL(file);
    setCategoryImagePreview(previewUrl);
    setCategoryError('');
  };

  const handleRemoveCategoryImage = () => {
    if (categoryImagePreview && categoryImagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(categoryImagePreview);
    }
    setCategoryImageFile(null);
    setCategoryImagePreview('');
    setCategoryImage('');
    const fileInput = document.getElementById('category-image-file-input');
    if (fileInput) fileInput.value = '';
  };


  // =====================================
  // SAVE CATEGORY
  // CREATE OR UPDATE
  // =====================================
  const handleCategorySubmit = async (e) => {
    e.preventDefault();

    if (!categoryName.trim()) {
      setCategoryError('Category name is required');
      return;
    }

    setCategorySaving(true);
    setCategoryError('');

    try {
      const token = getAdminToken();

      if (!token) {
        throw new Error('Admin login token not found. Please log in again.');
      }

      let finalImageUrl = categoryImage;

      // If a new image file was selected from computer, upload it first
      if (categoryImageFile) {
        setCategoryImageUploading(true);
        const formData = new FormData();
        formData.append('image', categoryImageFile);

        const uploadResponse = await fetch(`${API_URL}/categories/upload`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: formData
        });

        const uploadData = await uploadResponse.json();

        if (!uploadResponse.ok || !uploadData.success) {
          throw new Error(uploadData.message || 'Failed to upload category image');
        }

        finalImageUrl = uploadData.imageUrl;
      }

      const categoryData = {
        name: categoryName.trim(),
        description: categoryDescription,
        image: finalImageUrl,
        status: categoryStatus
      };

      const url = editingCategory
        ? `${API_URL}/categories/${editingCategory.id}`
        : `${API_URL}/categories`;

      const method = editingCategory ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(categoryData)
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to save category');
      }

      resetCategoryForm();
      await loadCategories();

    } catch (error) {
      console.error('Save category error:', error);
      setCategoryError(error.message);
    } finally {
      setCategorySaving(false);
      setCategoryImageUploading(false);
    }
  };


  // =====================================
  // DELETE CATEGORY
  // =====================================
  const handleDeleteCategory = async (categoryId) => {
    const confirmed = window.confirm(
      'Are you sure you want to deactivate this category?'
    );

    if (!confirmed) {
      return;
    }

    try {
      const token = getAdminToken();

      const response = await fetch(
        `${API_URL}/categories/${categoryId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete category');
      }

      await loadCategories();

    } catch (error) {
      console.error('Delete category error:', error);
      setCategoryError(error.message);
    }
  };
  // =====================================
  // PERMANENTLY DELETE CATEGORY
  // =====================================
  const handlePermanentDeleteCategory = async (categoryId) => {
    const confirmed = window.confirm(
      'Are you sure you want to permanently delete this category? This action cannot be undone.'
    );

    if (!confirmed) return;

    try {
      const token = getAdminToken();

      const response = await fetch(
        `${API_URL}/categories/${categoryId}/permanent`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || 'Failed to permanently delete category'
        );
      }

      alert(data.message);

      await loadCategories();

    } catch (error) {
      console.error(
        'Permanent delete category error:',
        error
      );

      setCategoryError(error.message);
    }
  };

  // =====================================
  // BANNER MANAGEMENT HANDLERS
  // =====================================
  const loadBanners = async () => {
    try {
      setBannerLoading(true);
      setBannerError('');
      const token = getAdminToken();
      if (!token) return;

      const response = await fetch(`${API_URL}/banners/admin/all`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to load promotional banners');
      }

      setBanners(data.banners || []);
    } catch (error) {
      console.error('loadBanners error:', error);
      setBannerError(error.message || 'Failed to load banners');
    } finally {
      setBannerLoading(false);
    }
  };

  const resetBannerForm = () => {
    if (bannerImagePreview && bannerImagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(bannerImagePreview);
    }
    setEditingBanner(null);
    setBannerTitle('');
    setBannerDescription('');
    setBannerButtonText('Shop Now');
    setBannerLinkUrl('/products');
    setBannerImage('');
    setBannerCloudinaryId('');
    setBannerImageFile(null);
    setBannerImagePreview('');
    setBannerStatus('active');
    setBannerDisplayOrder(banners.length + 1);
    setShowBannerForm(false);
    setBannerError('');
  };

  const handleOpenAddBanner = () => {
    resetBannerForm();
    const activeCount = banners.filter(b => b.status === 'active').length;
    // If already 5 active, default status to inactive so admin is guided
    setBannerStatus(activeCount >= 5 ? 'inactive' : 'active');
    setBannerDisplayOrder(banners.length + 1);
    setShowBannerForm(true);
  };

  const handleEditBanner = (banner) => {
    if (bannerImagePreview && bannerImagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(bannerImagePreview);
    }
    setEditingBanner(banner);
    setBannerTitle(banner.title || '');
    setBannerDescription(banner.description || '');
    setBannerButtonText(banner.button_text || 'Shop Now');
    setBannerLinkUrl(banner.link_url || '/products');
    setBannerImage(banner.image_url || '');
    setBannerCloudinaryId(banner.cloudinary_id || '');
    setBannerImageFile(null);
    setBannerImagePreview(banner.image_url || '');
    setBannerStatus(banner.status || 'active');
    setBannerDisplayOrder(banner.display_order || 1);
    setShowBannerForm(true);
    setBannerError('');
  };

  const handleBannerImageFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.type)) {
      setBannerError('Invalid file format. Allowed formats: JPG, PNG, WebP, and animated GIF.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setBannerError('File size exceeds the 5MB limit. Please choose a smaller image or GIF.');
      return;
    }

    setBannerError('');

    if (bannerImagePreview && bannerImagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(bannerImagePreview);
    }

    const previewUrl = URL.createObjectURL(file);
    setBannerImageFile(file);
    setBannerImagePreview(previewUrl);
  };

  const handleRemoveBannerImageFile = () => {
    if (bannerImagePreview && bannerImagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(bannerImagePreview);
    }
    setBannerImageFile(null);
    setBannerImagePreview(editingBanner ? editingBanner.image_url : '');
    const fileInput = document.getElementById('banner-image-file-input');
    if (fileInput) fileInput.value = '';
  };

  const handleBannerSubmit = async (e) => {
    e.preventDefault();

    if (!bannerTitle.trim()) {
      setBannerError('Banner title is required');
      return;
    }

    if (!bannerImageFile && !bannerImage) {
      setBannerError('Please upload an image or animated GIF for the banner');
      return;
    }

    const activeCount = banners.filter(b => b.status === 'active' && (!editingBanner || b.id !== editingBanner.id)).length;
    if (bannerStatus === 'active' && activeCount >= 5) {
      setBannerError('Maximum 5 active banners allowed in carousel. Please set status to Inactive or deactivate an existing banner first.');
      return;
    }

    setBannerSaving(true);
    setBannerError('');
    setBannerSuccess('');

    try {
      const token = getAdminToken();
      if (!token) throw new Error('Admin token not found. Please log in again.');

      let finalImageUrl = bannerImage;
      let finalCloudinaryId = bannerCloudinaryId;

      // If user uploaded a new image/GIF file from computer
      if (bannerImageFile) {
        setBannerImageUploading(true);
        const formData = new FormData();
        formData.append('image', bannerImageFile);

        const uploadRes = await fetch(`${API_URL}/banners/upload`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: formData
        });

        const uploadData = await uploadRes.json();
        setBannerImageUploading(false);

        if (!uploadRes.ok || !uploadData.success) {
          throw new Error(uploadData.message || 'Failed to upload banner media');
        }

        finalImageUrl = uploadData.imageUrl;
        finalCloudinaryId = uploadData.filename || null;
      }

      const payload = {
        title: bannerTitle.trim(),
        description: bannerDescription.trim(),
        image_url: finalImageUrl,
        cloudinary_id: finalCloudinaryId,
        button_text: bannerButtonText.trim(),
        link_url: bannerLinkUrl.trim(),
        display_order: parseInt(bannerDisplayOrder, 10) || 1,
        status: bannerStatus
      };

      const url = editingBanner ? `${API_URL}/banners/${editingBanner.id}` : `${API_URL}/banners`;
      const method = editingBanner ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to save banner');
      }

      setBannerSuccess(editingBanner ? 'Banner updated successfully!' : 'Banner created successfully!');
      resetBannerForm();
      await loadBanners();

      setTimeout(() => {
        setBannerSuccess('');
      }, 4000);
    } catch (err) {
      console.error('Save banner error:', err);
      setBannerError(err.message || 'Failed to save banner');
    } finally {
      setBannerSaving(false);
      setBannerImageUploading(false);
    }
  };

  const handleDeleteBanner = async (bannerId) => {
    const confirmed = window.confirm('Are you sure you want to delete this promotional banner?');
    if (!confirmed) return;

    try {
      const token = getAdminToken();
      if (!token) return;

      const response = await fetch(`${API_URL}/banners/${bannerId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete banner');
      }

      setBannerSuccess('Banner deleted successfully!');
      await loadBanners();
      setTimeout(() => setBannerSuccess(''), 3000);
    } catch (err) {
      console.error('Delete banner error:', err);
      setBannerError(err.message || 'Failed to delete banner');
    }
  };

  const handleToggleBannerStatus = async (banner) => {
    try {
      const token = getAdminToken();
      if (!token) return;

      const newStatus = banner.status === 'active' ? 'inactive' : 'active';

      if (newStatus === 'active') {
        const activeCount = banners.filter(b => b.status === 'active' && b.id !== banner.id).length;
        if (activeCount >= 5) {
          alert('Maximum 5 active banners allowed in the carousel. Please deactivate an existing banner first.');
          return;
        }
      }

      const response = await fetch(`${API_URL}/banners/${banner.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...banner,
          status: newStatus
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to toggle banner status');
      }

      await loadBanners();
    } catch (err) {
      console.error('Toggle banner status error:', err);
      setBannerError(err.message || 'Failed to toggle banner status');
    }
  };

  const handleMoveBanner = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= banners.length) return;

    const newBanners = [...banners];
    const temp = newBanners[index];
    newBanners[index] = newBanners[targetIndex];
    newBanners[targetIndex] = temp;

    // Reassign sequential display orders
    const ordersPayload = newBanners.map((b, idx) => ({
      id: b.id,
      display_order: idx + 1
    }));

    setBanners(newBanners);

    try {
      const token = getAdminToken();
      if (!token) return;

      const res = await fetch(`${API_URL}/banners/reorder`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ orders: ordersPayload })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update banner order');
      }

      await loadBanners();
    } catch (err) {
      console.error('Reorder error:', err);
      setBannerError(err.message || 'Failed to update banner order');
      await loadBanners();
    }
  };
  // =====================================
  // LOAD PRODUCTS
  // =====================================
  const loadProducts = async () => {
    try {
      const token = getAdminToken();

      const response = await fetch(`${API_URL}/products`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load products');
      }

      setProducts(data.products || data);

    } catch (error) {
      console.error('Load products error:', error);
    }
  };
  // =====================================
  // UPDATE PRODUCT
  // =====================================
  const handleUpdateProduct = async () => {
    try {
      const token = getAdminToken();

      const response = await fetch(`${API_URL}/products/${productToEdit.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editedProductName,
          description: editedProductDescription,
          category: editedProductCategory,
          price: Number(editedProductPrice),
          original_price: Number(editedProductPrice),
          unit: 'piece',
          stock_quantity: Number(editedProductStock),
          image: editedProductImage,
          status: 'active'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update product');
      }

      alert('Product updated successfully!');
      setEditingProduct(null);
      setShowEditProductForm(false);
      loadProducts();

    } catch (error) {
      console.error('Update product error:', error);
      alert(error.message);
    }
  };
  // =====================================
  // PRODUCT FORM HELPERS
  // =====================================
  const openAddProductForm = () => {
    setEditingProduct(null);
    setProductName('');
    setProductDescription('');
    setProductCategory('');
    setProductPrice('');
    setProductOriginalPrice('');
    setProductStock('');
    setProductImage('');
    setProductImageFile(null);
    setProductImagePreview('');
    setShowProductForm(true);
  };

  const openEditProductForm = (product) => {
    setEditingProduct(product);

    setProductName(product.name || '');
    setProductDescription(product.description || '');
    setProductCategory(product.category_name || '');
    setProductPrice(product.price || '');
    // Populate originalPrice: use saved value if it exists and differs from price,
    // otherwise leave blank so the admin can set it intentionally.
    setProductOriginalPrice(
      product.original_price != null && Number(product.original_price) !== Number(product.price)
        ? product.original_price
        : ''
    );
    setProductStock(product.stock_quantity || '');
    setProductImage(product.image || '');
    setProductImageFile(null);
    setProductImagePreview(product.image || '');

    setShowProductForm(true);
  };

  const handleCancelProductForm = () => {
    setEditingProduct(null);
    setProductName('');
    setProductDescription('');
    setProductCategory('');
    setProductPrice('');
    setProductOriginalPrice('');
    setProductStock('');
    setProductImage('');
    setProductImageFile(null);
    setProductImagePreview('');
    setShowProductForm(false);
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Please select a valid image file (JPG, JPEG, PNG, or WEBP).');
      e.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image file size must be less than 5MB.');
      e.target.value = '';
      return;
    }

    setProductImageFile(file);
    const previewUrl = URL.createObjectURL(file);
    setProductImagePreview(previewUrl);
  };

  const handleRemoveImage = () => {
    setProductImageFile(null);
    setProductImagePreview('');
    setProductImage('');
    const input = document.getElementById('product-image-file-input');
    if (input) input.value = '';
  };

  // =====================================
  // ADD OR UPDATE PRODUCT
  // =====================================
  const handleProductSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = getAdminToken();
      let finalImageUrl = productImage;

      // If an image file was selected from device, upload it first
      if (productImageFile) {
        setImageUploading(true);
        const formData = new FormData();
        formData.append('image', productImageFile);

        const savedUser = localStorage.getItem('grocery_admin_user');

        if (!savedUser) {
          throw new Error('Admin login token not found.');
        }

        const userData = JSON.parse(savedUser);

        const uploadResponse = await fetch(`${API_URL}/products/upload`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${userData.token}`
          },
          body: formData
        });

        const uploadData = await uploadResponse.json();

        if (!uploadResponse.ok || !uploadData.success) {
          throw new Error(uploadData.message || 'Failed to upload product image');
        }

        finalImageUrl = uploadData.imageUrl;
      }

      const sellingPrice = Number(productPrice);
      // If admin left Original Price blank, treat it as equal to Selling Price (no discount).
      const originalPrice =
        productOriginalPrice !== '' && productOriginalPrice !== null
          ? Number(productOriginalPrice)
          : sellingPrice;

      if (isNaN(sellingPrice) || sellingPrice < 0) {
        alert('Selling Price must be a valid non-negative number.');
        return;
      }
      if (isNaN(originalPrice) || originalPrice < 0) {
        alert('Original Price (MRP) must be a valid non-negative number.');
        return;
      }

      const productData = {
        name: productName,
        description: productDescription,
        category: productCategory,
        price: sellingPrice,
        original_price: originalPrice,
        unit: 'piece',
        stock_quantity: Number(productStock),
        image: finalImageUrl,
        status: 'active'
      };

      const url = editingProduct
        ? `${API_URL}/products/${editingProduct.id}`
        : `${API_URL}/products`;

      const method = editingProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(productData)
      });

      const responseText = await response.text();

      let data;

      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error(
          `Server returned an invalid response:\n${responseText.slice(0, 300)}`
        );
      }

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save product');
      }

      alert(
        editingProduct
          ? 'Product updated successfully!'
          : 'Product added successfully!'
      );

      setProductName('');
      setProductDescription('');
      setProductCategory('');
      setProductPrice('');
      setProductOriginalPrice('');
      setProductStock('');
      setProductImage('');
      setProductImageFile(null);
      setProductImagePreview('');

      setEditingProduct(null);
      setShowProductForm(false);

      loadProducts();

    } catch (error) {
      console.error('Save product error:', error);
      alert(error.message);
    } finally {
      setImageUploading(false);
    }
  };
  //-----------------------------------------------//  
  const handleDeleteProduct = async (productId) => {
    const confirmed = window.confirm(
      'Are you sure you want to permanently delete this product? This action cannot be undone.'
    );

    if (!confirmed) return;

    try {
      const token = getAdminToken();

      const response = await fetch(
        `${API_URL}/products/${productId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const responseText = await response.text();

      let data;

      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error(
          `Server returned ${response.status}: ${responseText.slice(0, 150)}`
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to delete product'
        );
      }

      alert('Product permanently deleted successfully!');

      loadProducts();

    } catch (error) {
      console.error('Delete product error:', error);
      alert(error.message);
    }
  };
  const handleLogout = () => {
    localStorage.removeItem('grocery_admin_user');
    setIsAuthenticated(false);
    setEmail('');
    setPassword('');
    setError('');
  };

  // =====================================
  // DASHBOARD STATISTICS (CURRENT MONTH)
  // =====================================
  const currentMonthLabel =
    dashboardStatsData.month ||
    new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });

  const formatRevenue = (amount) => {
    const num = Number(amount || 0);
    if (num === 0) return '₹0';
    return `₹${num.toLocaleString('en-IN', {
      minimumFractionDigits: num % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2
    })}`;
  };

  const dashboardStats = [
    {
      title: "This Month's Revenue",
      value: dashboardStatsLoading ? '...' : formatRevenue(dashboardStatsData.revenue),
      icon: <DollarSign color="#10b981" size={24} />,
      change: currentMonthLabel
    },
    {
      title: "This Month's Orders",
      value: dashboardStatsLoading ? '...' : `${dashboardStatsData.orders}`,
      icon: <ShoppingBag color="#3b82f6" size={24} />,
      change: `${currentMonthLabel} Orders`
    },
    {
      title: 'Total Products',
      value: products.length,
      icon: <Package color="#8b5cf6" size={24} />,
      change: 'Products in catalog'
    },
    {
      title: 'Total Categories',
      value: categories.length,
      icon: <FolderTree color="#f59e0b" size={24} />,
      change: 'Grocery categories'
    }
  ];



  // =====================================
  // LOGIN SCREEN
  // =====================================
  if (!isAuthenticated) {
    return (
      <div
        style={{
          maxWidth: '420px',
          margin: '4rem auto',
          background: 'white',
          padding: '2rem',
          borderRadius: '16px',
          border: '1px solid var(--border)',
          borderTop: '4px solid #3b82f6'
        }}
      >

        <a
          href="https://fast-delivery-hazel.vercel.app"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--text-muted)',
            fontSize: '0.85rem',
            marginBottom: '1rem',
            textDecoration: 'none',
            fontWeight: 600
          }}
        >
          <ArrowLeft size={16} />
          Back to Role Selection
        </a>


        <div
          style={{
            textAlign: 'center',
            marginBottom: '1.5rem'
          }}
        >

          <div
            style={{
              background: '#dbeafe',
              width: '50px',
              height: '50px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 0.75rem',
              color: '#2563eb'
            }}
          >
            <ShieldCheck size={28} />
          </div>

          <h2
            style={{
              fontSize: '1.4rem',
              fontWeight: 800
            }}
          >
            Admin Portal Authentication
          </h2>

          <p
            style={{
              color: 'var(--text-muted)',
              fontSize: '0.85rem'
            }}
          >
            Admin credentials required to view dashboard
          </p>

        </div>


        {/* ERROR MESSAGE */}
        {error && (
          <div
            style={{
              color: '#b91c1c',
              background: '#fee2e2',
              padding: '10px',
              borderRadius: '8px',
              marginBottom: '1rem',
              textAlign: 'center',
              fontSize: '0.85rem'
            }}
          >
            {error}
          </div>
        )}


        <form onSubmit={handleLogin}>

          <div style={{ marginBottom: '1rem' }}>

            <label
              style={{
                display: 'block',
                fontSize: '0.85rem',
                fontWeight: 600,
                marginBottom: '0.3rem'
              }}
            >
              Admin Email
            </label>

            <input
              type="email"
              required
              placeholder="Enter admin email"
              style={{
                width: '100%',
                padding: '0.65rem',
                border: '1px solid var(--border)',
                borderRadius: '8px'
              }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

          </div>


          <div style={{ marginBottom: '1.2rem' }}>

            <label
              style={{
                display: 'block',
                fontSize: '0.85rem',
                fontWeight: 600,
                marginBottom: '0.3rem'
              }}
            >
              Password
            </label>

            <input
              type="password"
              required
              placeholder="Enter admin password"
              style={{
                width: '100%',
                padding: '0.65rem',
                border: '1px solid var(--border)',
                borderRadius: '8px'
              }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

          </div>


          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '0.75rem',
              borderRadius: '8px',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading
              ? 'Signing In...'
              : 'Sign In to Admin Dashboard →'}
          </button>

        </form>

      </div>
    );
  }


  // =====================================
  // ADMIN DASHBOARD
  // =====================================
  return (
    <div className="admin-layout">

      {/* Sidebar Navigation */}
      <aside className="sidebar">

        <div className="sidebar-title">
          <ShoppingBag color="#10b981" size={24} />
          <span>Admin Portal</span>
        </div>


        <ul className="sidebar-menu">

          <li
            className={`sidebar-link ${activeTab === 'dashboard' ? 'active' : ''
              }`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard Overview</span>
          </li>


          <li
            className={`sidebar-link ${activeTab === 'products' ? 'active' : ''
              }`}
            onClick={() => setActiveTab('products')}
          >
            <Package size={18} />
            <span>Products Catalog</span>
          </li>


          <li
            className={`sidebar-link ${activeTab === 'categories' ? 'active' : ''
              }`}
            onClick={() => setActiveTab('categories')}
          >
            <FolderTree size={18} />
            <span>Categories</span>
          </li>


          <li
            className={`sidebar-link ${activeTab === 'orders' ? 'active' : ''
              }`}
            onClick={() => setActiveTab('orders')}
          >
            <ShoppingBag size={18} />
            <span>Orders Management</span>
          </li>


          <li
            className={`sidebar-link ${activeTab === 'deliveryPartners' ? 'active' : ''
              }`}
            onClick={() => setActiveTab('deliveryPartners')}
          >
            <Truck size={18} />
            <span>Delivery Partners</span>
          </li>

          <li
            className={`sidebar-link ${activeTab === 'banners' ? 'active' : ''}`}
            onClick={() => setActiveTab('banners')}
          >
            <ImageIcon size={18} />
            <span>Promotional Banners</span>
          </li>
        </ul>


        <button
          onClick={handleLogout}
          style={{
            marginTop: 'auto',
            background: '#1e293b',
            color: '#ef4444',
            border: 'none',
            padding: '0.6rem',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: 600,
            fontSize: '0.85rem'
          }}
        >
          <LogOut size={16} />
          Logout Admin
        </button>

      </aside>


      {/* Main Content Area */}
      <main className="admin-main">

        {activeTab === 'dashboard' && (
          <>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem',
                flexWrap: 'wrap',
                gap: '0.8rem'
              }}
            >
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>
                  Dashboard Overview
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.2rem 0 0' }}>
                  Showing store performance for <strong>{currentMonthLabel}</strong>
                </p>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  background: 'white',
                  border: '1px solid var(--border)',
                  padding: '0.45rem 0.9rem',
                  borderRadius: '10px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#10b981'
                  }}
                />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {currentMonthLabel}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', borderLeft: '1px solid var(--border)', paddingLeft: '0.5rem' }}>
                  Current Month
                </span>
              </div>
            </div>

            {dashboardStatsError && (
              <div
                style={{
                  background: '#fee2e2',
                  color: '#b91c1c',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  marginBottom: '1.5rem',
                  fontSize: '0.85rem',
                  fontWeight: 600
                }}
              >
                Failed to load current month statistics: {dashboardStatsError}
              </div>
            )}

            <div className="stats-grid">

              {dashboardStats.map((stat, idx) => (
                <div
                  key={idx}
                  className="stat-card"
                >

                  <div>

                    <span
                      style={{
                        fontSize: '0.8rem',
                        color: 'var(--text-muted)',
                        fontWeight: 600
                      }}
                    >
                      {stat.title}
                    </span>

                    <div
                      style={{
                        fontSize: '1.5rem',
                        fontWeight: 800,
                        margin: '0.3rem 0'
                      }}
                    >
                      {stat.value}
                    </div>

                    <span
                      style={{
                        fontSize: '0.75rem',
                        color: '#10b981',
                        fontWeight: 600
                      }}
                    >
                      {stat.change}
                    </span>

                  </div>

                  <div
                    style={{
                      background: '#f1f5f9',
                      padding: '0.6rem',
                      borderRadius: '10px'
                    }}
                  >
                    {stat.icon}
                  </div>

                </div>
              ))}

            </div>


            {/* Recent Orders Overview */}
            <div className="table-card">

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem'
                }}
              >

                <h3
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: 800
                  }}
                >
                  Live Orders Overview
                </h3>

                <span
                  style={{
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)'
                  }}
                >
                  Updated just now
                </span>

              </div>


              <div style={{ overflowX: 'auto' }}>

                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    textAlign: 'left',
                    fontSize: '0.9rem'
                  }}
                >

                  <thead>

                    <tr
                      style={{
                        borderBottom: '2px solid var(--border)',
                        color: 'var(--text-muted)'
                      }}
                    >

                      <th style={{ padding: '0.75rem' }}>
                        Order ID
                      </th>

                      <th style={{ padding: '0.75rem' }}>
                        Customer
                      </th>

                      <th style={{ padding: '0.75rem' }}>
                        Total
                      </th>

                      <th style={{ padding: '0.75rem' }}>
                        Payment
                      </th>

                      <th style={{ padding: '0.75rem' }}>
                        Status
                      </th>

                      <th style={{ padding: '0.75rem' }}>
                        Time
                      </th>

                    </tr>

                  </thead>


                  <tbody>
                    {orderLoading ? (
                      <tr>
                        <td
                          colSpan="6"
                          style={{
                            padding: '1rem',
                            textAlign: 'center',
                            color: 'var(--text-muted)'
                          }}
                        >
                          Loading latest orders...
                        </td>
                      </tr>
                    ) : orders.length === 0 ? (
                      <tr>
                        <td
                          colSpan="7"
                          style={{
                            padding: '1rem',
                            textAlign: 'center',
                            color: 'var(--text-muted)'
                          }}
                        >
                          No customer orders found.
                        </td>
                      </tr>
                    ) : (
                      orders.slice(0, 5).map((order) => (
                        <tr
                          key={order.id}
                          style={{
                            borderBottom: '1px solid var(--border)'
                          }}
                        >
                          <td
                            style={{
                              padding: '0.75rem',
                              fontWeight: 700
                            }}
                          >
                            {order.order_number || `#${order.id}`}
                          </td>

                          <td style={{ padding: '0.75rem' }}>
                            {order.customer_name ||
                              order.full_name ||
                              order.name ||
                              'Customer'}
                          </td>

                          <td style={{ padding: '0.75rem' }}>
                            ₹{Number(order.total_amount || 0).toFixed(2)}
                          </td>

                          <td style={{ padding: '0.75rem' }}>
                            {(order.payment_method || 'cod').toUpperCase()}
                          </td>

                          <td style={{ padding: '0.75rem' }}>
                            <span
                              style={{
                                background:
                                  order.order_status === 'delivered'
                                    ? '#d1fae5'
                                    : order.order_status === 'cancelled'
                                      ? '#fee2e2'
                                      : '#dbeafe',
                                color:
                                  order.order_status === 'delivered'
                                    ? '#047857'
                                    : order.order_status === 'cancelled'
                                      ? '#b91c1c'
                                      : '#1d4ed8',
                                padding: '0.25rem 0.6rem',
                                borderRadius: '12px',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {(order.order_status || 'placed')
                                .replaceAll('_', ' ')
                                .replace(/\b\w/g, letter => letter.toUpperCase())}
                            </span>
                          </td>

                          <td
                            style={{
                              padding: '0.75rem',
                              color: 'var(--text-muted)',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {order.created_at
                              ? new Date(order.created_at).toLocaleString('en-IN')
                              : '—'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

              </div>

            </div>

          </>
        )}

        {/* ===================================== */}
        {/* CATEGORIES MANAGEMENT */}
        {/* ===================================== */}

        {activeTab === 'categories' && (
          <div className="table-card">

            <div



              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '1.2rem',
                flexWrap: 'wrap'
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: '1.3rem',
                    fontWeight: 800,
                    marginBottom: '0.3rem'
                  }}
                >
                  Categories Management
                </h2>

                <p
                  style={{
                    color: 'var(--text-muted)',
                    fontSize: '0.85rem'
                  }}
                >
                  Add, edit and deactivate grocery categories
                </p>
              </div>

              <button
                onClick={openAddCategoryForm}
                style={{
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  padding: '0.7rem 1rem',
                  borderRadius: '8px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                + Add Category
              </button>
            </div>


            {/* ERROR */}
            {categoryError && (
              <div
                style={{
                  background: '#fee2e2',
                  color: '#b91c1c',
                  padding: '0.8rem',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  fontSize: '0.85rem'
                }}
              >
                {categoryError}
              </div>
            )}


            {/* CATEGORY FORM */}
            {showCategoryForm && (
              <form
                onSubmit={handleCategorySubmit}
                style={{
                  background: '#f8fafc',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '1rem',
                  marginBottom: '1.5rem'
                }}
              >

                <h3
                  style={{
                    fontSize: '1rem',
                    fontWeight: 800,
                    marginBottom: '1rem'
                  }}
                >
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
                </h3>


                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '1rem'
                  }}
                >

                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        marginBottom: '0.4rem'
                      }}
                    >
                      Category Name
                    </label>

                    <input
                      type="text"
                      required
                      value={categoryName}
                      onChange={(e) => setCategoryName(e.target.value)}
                      placeholder="Example: Dairy & Eggs"
                      style={{
                        width: '100%',
                        padding: '0.65rem',
                        border: '1px solid var(--border)',
                        borderRadius: '8px'
                      }}
                    />
                  </div>


                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        marginBottom: '0.4rem'
                      }}
                    >
                      Category Image
                    </label>

                    {/* Device File Selector */}
                    <input
                      id="category-image-file-input"
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/jpg"
                      onChange={handleCategoryImageFileChange}
                      disabled={categorySaving || categoryImageUploading}
                      style={{
                        width: '100%',
                        padding: '0.45rem',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        background: '#ffffff',
                        fontSize: '0.82rem',
                        cursor: (categorySaving || categoryImageUploading) ? 'not-allowed' : 'pointer'
                      }}
                    />

                    {/* Image Preview & Remove Button */}
                    {categoryImagePreview && (
                      <div
                        style={{
                          marginTop: '0.6rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          background: '#ffffff',
                          padding: '0.5rem',
                          borderRadius: '8px',
                          border: '1px solid var(--border)'
                        }}
                      >
                        <img
                          src={categoryImagePreview}
                          alt="Category Preview"
                          style={{
                            width: '48px',
                            height: '48px',
                            objectFit: 'cover',
                            borderRadius: '6px',
                            border: '1px solid #e2e8f0'
                          }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <span
                            style={{
                              display: 'block',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              color: '#334155',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {categoryImageFile ? categoryImageFile.name : 'Current Image'}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                            {categoryImageFile ? `${(categoryImageFile.size / 1024).toFixed(1)} KB` : 'Attached to category'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveCategoryImage}
                          disabled={categorySaving || categoryImageUploading}
                          style={{
                            background: '#fee2e2',
                            color: '#dc2626',
                            border: 'none',
                            padding: '0.35rem 0.65rem',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: (categorySaving || categoryImageUploading) ? 'not-allowed' : 'pointer'
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    )}

                    {/* Optional URL fallback input */}
                    <div style={{ marginTop: '0.5rem' }}>
                      <input
                        type="url"
                        value={categoryImage}
                        disabled={categorySaving || categoryImageUploading}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCategoryImage(val);
                          if (!categoryImageFile) {
                            setCategoryImagePreview(val);
                          }
                        }}
                        placeholder="Or enter image URL (optional)"
                        style={{
                          width: '100%',
                          padding: '0.5rem 0.65rem',
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                          fontSize: '0.8rem'
                        }}
                      />
                    </div>
                  </div>

                </div>


                <div style={{ marginTop: '1rem' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      marginBottom: '0.4rem'
                    }}
                  >
                    Description
                  </label>

                  <textarea
                    value={categoryDescription}
                    onChange={(e) => setCategoryDescription(e.target.value)}
                    placeholder="Write a short category description"
                    rows="3"
                    style={{
                      width: '100%',
                      padding: '0.65rem',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      resize: 'vertical'
                    }}
                  />
                </div>


                <div style={{ marginTop: '1rem' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      marginBottom: '0.4rem'
                    }}
                  >
                    Status
                  </label>

                  <select
                    value={categoryStatus}
                    onChange={(e) => setCategoryStatus(e.target.value)}
                    style={{
                      padding: '0.65rem',
                      border: '1px solid var(--border)',
                      borderRadius: '8px'
                    }}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>


                <div
                  style={{
                    display: 'flex',
                    gap: '0.7rem',
                    marginTop: '1rem'
                  }}
                >

                  <button
                    type="submit"
                    disabled={categorySaving || categoryImageUploading}
                    style={{
                      background: (categorySaving || categoryImageUploading) ? '#93c5fd' : '#2563eb',
                      color: 'white',
                      border: 'none',
                      padding: '0.65rem 1rem',
                      borderRadius: '8px',
                      fontWeight: 700,
                      cursor: (categorySaving || categoryImageUploading) ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {categoryImageUploading
                      ? 'Uploading image...'
                      : categorySaving
                        ? 'Saving...'
                        : editingCategory
                          ? 'Update Category'
                          : 'Save Category'}
                  </button>


                  <button
                    type="button"
                    onClick={resetCategoryForm}
                    disabled={categorySaving || categoryImageUploading}
                    style={{
                      background: '#e5e7eb',
                      color: '#111827',
                      border: 'none',
                      padding: '0.65rem 1rem',
                      borderRadius: '8px',
                      fontWeight: 700,
                      cursor: (categorySaving || categoryImageUploading) ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Cancel
                  </button>

                </div>

              </form>
            )}


            {/* CATEGORY TABLE */}
            {categoryLoading ? (
              <p style={{ color: 'var(--text-muted)' }}>
                Loading categories...
              </p>
            ) : categories.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>
                No categories found.
              </p>
            ) : (
              <div style={{ overflowX: 'auto' }}>

                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    textAlign: 'left',
                    fontSize: '0.9rem'
                  }}
                >

                  <thead>
                    <tr
                      style={{
                        borderBottom: '2px solid var(--border)'
                      }}
                    >
                      <th style={{ padding: '0.75rem' }}>
                        Image
                      </th>

                      <th style={{ padding: '0.75rem' }}>
                        Name
                      </th>

                      <th style={{ padding: '0.75rem' }}>
                        Description
                      </th>

                      <th style={{ padding: '0.75rem' }}>
                        Status
                      </th>

                      <th style={{ padding: '0.75rem' }}>
                        Actions
                      </th>
                    </tr>
                  </thead>


                  <tbody>
                    {categories.map(category => (
                      <tr
                        key={category.id}
                        style={{
                          borderBottom: '1px solid var(--border)'
                        }}
                      >

                        <td style={{ padding: '0.75rem' }}>
                          {category.image ? (
                            <img
                              src={category.image}
                              alt={category.name}
                              style={{
                                width: '55px',
                                height: '55px',
                                objectFit: 'cover',
                                borderRadius: '8px'
                              }}
                            />
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>
                              No image
                            </span>
                          )}
                        </td>


                        <td
                          style={{
                            padding: '0.75rem',
                            fontWeight: 700
                          }}
                        >
                          {category.name}
                        </td>


                        <td
                          style={{
                            padding: '0.75rem',
                            color: 'var(--text-muted)',
                            maxWidth: '280px'
                          }}
                        >
                          {category.description || '—'}
                        </td>


                        <td style={{ padding: '0.75rem' }}>
                          <span
                            style={{
                              background: category.status === 'active'
                                ? '#d1fae5'
                                : '#fee2e2',
                              color: category.status === 'active'
                                ? '#047857'
                                : '#b91c1c',
                              padding: '0.25rem 0.6rem',
                              borderRadius: '12px',
                              fontSize: '0.78rem',
                              fontWeight: 700
                            }}
                          >
                            {category.status}
                          </span>
                        </td>


                        <td style={{ padding: '0.75rem' }}>
                          <div
                            style={{
                              display: 'flex',
                              gap: '0.5rem',
                              flexWrap: 'wrap'
                            }}
                          >

                            <button
                              onClick={() => openEditCategoryForm(category)}
                              style={{
                                background: '#dbeafe',
                                color: '#1d4ed8',
                                border: 'none',
                                padding: '0.4rem 0.7rem',
                                borderRadius: '6px',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              Edit
                            </button>


                            <button
                              onClick={() => handleDeleteCategory(category.id)}
                              style={{
                                background: '#fee2e2',
                                color: '#b91c1c',
                                border: 'none',
                                padding: '0.4rem 0.7rem',
                                borderRadius: '6px',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              Deactivate
                            </button>
                            <button
                              onClick={() => handlePermanentDeleteCategory(category.id)}
                              style={{
                                background: '#991b1b',
                                color: 'white',
                                border: 'none',
                                padding: '0.4rem 0.7rem',
                                borderRadius: '6px',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              Delete Permanently
                            </button>
                          </div>
                        </td>

                      </tr>
                    ))}
                  </tbody>

                </table>

              </div>
            )}

          </div>
        )}
        {/* PRODUCTS MANAGEMENT */}
        {activeTab === 'products' && (
          <div className="table-card">

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '1.2rem',
                flexWrap: 'wrap'
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: '1.3rem',
                    fontWeight: 800,
                    marginBottom: '0.3rem'
                  }}
                >
                  Products Catalog
                </h2>

                <p style={{ color: 'var(--text-muted)' }}>
                  Add and manage grocery products
                </p>
              </div>

              <button
                onClick={openAddProductForm}
                style={{
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  padding: '0.7rem 1rem',
                  borderRadius: '8px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                + Add Product
              </button>
            </div>

            {/* PRODUCT FORM */}
            {showProductForm && (
              <form
                onSubmit={handleProductSubmit}
                style={{
                  background: '#f8fafc',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '1rem',
                  marginBottom: '1.5rem'
                }}
              >
                <h3
                  style={{
                    fontSize: '1rem',
                    fontWeight: 800,
                    marginBottom: '1rem'
                  }}
                >
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h3>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '1rem'
                  }}
                >
                  {/* PRODUCT NAME */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        marginBottom: '0.4rem'
                      }}
                    >
                      Product Name
                    </label>

                    <input
                      type="text"
                      required
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      placeholder="Example: Fresh Apples"
                      style={{
                        width: '100%',
                        padding: '0.65rem',
                        border: '1px solid var(--border)',
                        borderRadius: '8px'
                      }}
                    />
                  </div>

                  {/* CATEGORY */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        marginBottom: '0.4rem'
                      }}
                    >
                      Category
                    </label>

                    <select
                      required
                      value={productCategory}
                      onChange={(e) => setProductCategory(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.65rem',
                        border: '1px solid var(--border)',
                        borderRadius: '8px'
                      }}
                    >
                      <option value="">Select Category</option>

                      {categories.map(category => (
                        <option
                          key={category.id}
                          value={category.name}
                        >
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* ORIGINAL PRICE (MRP) */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        marginBottom: '0.4rem'
                      }}
                    >
                      Original Price / MRP
                      <span style={{ fontWeight: 400, color: 'var(--text-muted)', marginLeft: '0.35rem' }}>
                        (crossed-out price — leave blank if no discount)
                      </span>
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={productOriginalPrice}
                      onChange={(e) => setProductOriginalPrice(e.target.value)}
                      placeholder="Example: 150 (optional)"
                      style={{
                        width: '100%',
                        padding: '0.65rem',
                        border: '1px solid var(--border)',
                        borderRadius: '8px'
                      }}
                    />
                  </div>

                  {/* SELLING PRICE */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        marginBottom: '0.4rem'
                      }}
                    >
                      Selling Price
                    </label>

                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={productPrice}
                      onChange={(e) => setProductPrice(e.target.value)}
                      placeholder="Example: 120"
                      style={{
                        width: '100%',
                        padding: '0.65rem',
                        border: '1px solid var(--border)',
                        borderRadius: '8px'
                      }}
                    />
                  </div>

                  {/* STOCK */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        marginBottom: '0.4rem'
                      }}
                    >
                      Stock Quantity
                    </label>

                    <input
                      type="number"
                      required
                      min="0"
                      value={productStock}
                      onChange={(e) => setProductStock(e.target.value)}
                      placeholder="Example: 50"
                      style={{
                        width: '100%',
                        padding: '0.65rem',
                        border: '1px solid var(--border)',
                        borderRadius: '8px'
                      }}
                    />
                  </div>

                  {/* PRODUCT IMAGE */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        marginBottom: '0.4rem'
                      }}
                    >
                      Product Image
                    </label>

                    {/* Device File Selector */}
                    <input
                      id="product-image-file-input"
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/jpg"
                      onChange={handleImageFileChange}
                      style={{
                        width: '100%',
                        padding: '0.45rem',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        background: '#ffffff',
                        fontSize: '0.82rem',
                        cursor: 'pointer'
                      }}
                    />

                    {/* Image Preview & Remove Button */}
                    {productImagePreview && (
                      <div
                        style={{
                          marginTop: '0.6rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          background: '#ffffff',
                          padding: '0.5rem',
                          borderRadius: '8px',
                          border: '1px solid var(--border)'
                        }}
                      >
                        <img
                          src={productImagePreview}
                          alt="Preview"
                          style={{
                            width: '48px',
                            height: '48px',
                            objectFit: 'cover',
                            borderRadius: '6px',
                            border: '1px solid #e2e8f0'
                          }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <span
                            style={{
                              display: 'block',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              color: '#334155',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {productImageFile ? productImageFile.name : 'Current Image'}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                            {productImageFile ? `${(productImageFile.size / 1024).toFixed(1)} KB` : 'Attached to product'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          style={{
                            background: '#fee2e2',
                            color: '#dc2626',
                            border: 'none',
                            padding: '0.35rem 0.65rem',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    )}

                    {/* Optional URL fallback input */}
                    <div style={{ marginTop: '0.5rem' }}>
                      <input
                        type="url"
                        value={productImage}
                        onChange={(e) => {
                          setProductImage(e.target.value);
                          if (!productImageFile) {
                            setProductImagePreview(e.target.value);
                          }
                        }}
                        placeholder="Or enter image URL (optional)"
                        style={{
                          width: '100%',
                          padding: '0.5rem 0.65rem',
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                          fontSize: '0.8rem'
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* DESCRIPTION */}
                <div style={{ marginTop: '1rem' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      marginBottom: '0.4rem'
                    }}
                  >
                    Product Description
                  </label>

                  <textarea
                    value={productDescription}
                    onChange={(e) =>
                      setProductDescription(e.target.value)
                    }
                    placeholder="Write a short product description"
                    rows="3"
                    style={{
                      width: '100%',
                      padding: '0.65rem',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      resize: 'vertical'
                    }}
                  />
                </div>

                {/* FORM BUTTONS */}
                <div
                  style={{
                    display: 'flex',
                    gap: '0.7rem',
                    marginTop: '1rem'
                  }}
                >
                  <button
                    type="submit"
                    disabled={imageUploading}
                    style={{
                      background: imageUploading ? '#93c5fd' : '#2563eb',
                      color: 'white',
                      border: 'none',
                      padding: '0.65rem 1rem',
                      borderRadius: '8px',
                      fontWeight: 700,
                      cursor: imageUploading ? 'not-allowed' : 'pointer'
                    }}>
                    {imageUploading
                      ? 'Uploading Image...'
                      : (editingProduct ? 'Update Product' : 'Save Product')}
                  </button>

                  <button
                    type="button"
                    onClick={handleCancelProductForm}
                    style={{
                      background: '#e5e7eb',
                      color: '#111827',
                      border: 'none',
                      padding: '0.65rem 1rem',
                      borderRadius: '8px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* PRODUCT LIST */}
            {products.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>
                No products added yet.
              </p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    textAlign: 'left',
                    fontSize: '0.9rem'
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        borderBottom: '2px solid var(--border)'
                      }}
                    >
                      <th style={{ padding: '0.75rem' }}>
                        Image
                      </th>

                      <th style={{ padding: '0.75rem' }}>
                        Product
                      </th>

                      <th style={{ padding: '0.75rem' }}>
                        Category
                      </th>

                      <th style={{ padding: '0.75rem' }}>
                        Price
                      </th>

                      <th style={{ padding: '0.75rem' }}>
                        Stock
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {products.map(product => (
                      <tr
                        key={product.id}
                        style={{
                          borderBottom: '1px solid var(--border)'
                        }}
                      >
                        <td style={{ padding: '0.75rem' }}>
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              style={{
                                width: '55px',
                                height: '55px',
                                objectFit: 'cover',
                                borderRadius: '8px'
                              }}
                            />
                          ) : (
                            <span
                              style={{
                                color: 'var(--text-muted)'
                              }}
                            >
                              No image
                            </span>
                          )}
                        </td>

                        <td
                          style={{
                            padding: '0.75rem',
                            fontWeight: 700
                          }}
                        >
                          {product.name}
                        </td>

                        <td style={{ padding: '0.75rem' }}>
                          {product.category_name}
                        </td>

                        <td
                          style={{
                            padding: '0.75rem',
                            fontWeight: 700
                          }}
                        >
                          ₹{product.price}
                        </td>

                        <td style={{ padding: '0.75rem' }}>
                          {product.stock_quantity}
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <button
                            onClick={() => openEditProductForm(product)}
                            style={{
                              padding: '0.5rem 0.75rem',
                              background: '#2563eb',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer'
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            style={{
                              padding: '0.5rem 0.75rem',
                              background: '#dc2626',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              marginLeft: '0.5rem'
                            }}
                          >
                            Delete
                          </button>

                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        {/* ORDERS MANAGEMENT */}
        {activeTab === 'orders' && (
          <div className="table-card">
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '1rem',
                flexWrap: 'wrap'
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: '1.3rem',
                    fontWeight: 800,
                    marginBottom: '0.3rem'
                  }}
                >
                  Orders Management
                </h2>

                <p style={{ color: 'var(--text-muted)' }}>
                  View customer orders and update their status.
                </p>
              </div>

              <button
                onClick={loadOrders}
                style={{
                  background: '#2563eb',
                  color: 'white',
                  border: 'none',
                  padding: '0.65rem 1rem',
                  borderRadius: '8px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Refresh Orders
              </button>
            </div>

            {orderError && (
              <div
                style={{
                  background: '#fee2e2',
                  color: '#b91c1c',
                  padding: '0.8rem',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  fontSize: '0.85rem'
                }}
              >
                {orderError}
              </div>
            )}

            {orderLoading ? (
              <p style={{ color: 'var(--text-muted)' }}>
                Loading orders...
              </p>
            ) : orders.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>
                No customer orders found.
              </p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    textAlign: 'left',
                    fontSize: '0.9rem'
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        borderBottom: '2px solid var(--border)'
                      }}
                    >
                      <th style={{ padding: '0.75rem' }}>
                        Order ID
                      </th>

                      <th style={{ padding: '0.75rem' }}>
                        Customer
                      </th>

                      <th style={{ padding: '0.75rem' }}>
                        Phone
                      </th>

                      <th style={{ padding: '0.75rem' }}>
                        Total
                      </th>

                      <th style={{ padding: '0.75rem' }}>
                        Payment
                      </th>

                      <th style={{ padding: '0.75rem' }}>
                        Status
                      </th>
                      <th style={{ padding: '0.75rem' }}>
                        Delivery Partner
                      </th>
                      <th style={{ padding: '0.75rem' }}>
                        Date
                      </th>
                      <th style={{ padding: '0.75rem' }}>
                        Items
                      </th>

                    </tr>
                  </thead>

                  <tbody>
                    {orders.map((order) => (
                      <tr
                        key={order.id}
                        style={{
                          borderBottom: '1px solid var(--border)'
                        }}
                      >
                        <td
                          style={{
                            padding: '0.75rem',
                            fontWeight: 700
                          }}
                        >
                          {order.order_number || `#${order.id}`}
                        </td>

                        <td style={{ padding: '0.75rem' }}>
                          {order.customer_name ||
                            order.full_name ||
                            order.name ||
                            'Customer'}
                        </td>

                        <td style={{ padding: '0.75rem' }}>
                          {order.phone || '—'}
                        </td>

                        <td
                          style={{
                            padding: '0.75rem',
                            fontWeight: 700
                          }}
                        >
                          ₹{Number(order.total_amount || 0).toFixed(2)}
                        </td>

                        <td style={{ padding: '0.75rem' }}>
                          {(order.payment_method || 'cod').toUpperCase()}
                        </td>

                        <td style={{ padding: '0.75rem' }}>
                          <select
                            value={order.order_status || 'placed'}
                            disabled={updatingOrderId === order.id}
                            onChange={(e) =>
                              handleUpdateOrderStatus(
                                order.id,
                                e.target.value
                              )
                            }
                            style={{
                              padding: '0.45rem',
                              border: '1px solid var(--border)',
                              borderRadius: '7px',
                              fontSize: '0.8rem',
                              minWidth: '150px'
                            }}
                          >
                            <option value="placed">
                              Placed
                            </option>

                            <option value="confirmed">
                              Confirmed
                            </option>

                            <option value="preparing">
                              Preparing
                            </option>

                            <option value="ready_for_pickup">
                              Ready for Pickup
                            </option>

                            <option value="assigned">
                              Assigned
                            </option>

                            <option value="picked_up">
                              Picked Up
                            </option>

                            <option value="out_for_delivery">
                              Out for Delivery
                            </option>

                            <option value="delivered">
                              Delivered
                            </option>

                            <option value="cancelled">
                              Cancelled
                            </option>
                          </select>
                        </td>
                        <td
                          style={{
                            padding: '0.75rem',
                            minWidth: '180px'
                          }}
                        >
                          <select
                            value={order.delivery_partner_id || ''}
                            disabled={
                              assigningOrderId === order.id ||
                              loadingDeliveryPartners
                            }
                            onChange={(e) =>
                              handleAssignDeliveryPartner(
                                order.id,
                                e.target.value
                              )
                            }
                            style={{
                              width: '100%',
                              padding: '0.55rem',
                              border: '1px solid var(--border)',
                              borderRadius: '8px',
                              background: 'white',
                              fontSize: '0.85rem'
                            }}
                          >
                            <option value="">
                              {loadingDeliveryPartners
                                ? 'Loading...'
                                : 'Assign Partner'}
                            </option>

                            {deliveryPartners.map((partner) => (
                              <option
                                key={partner.id}
                                value={partner.id}
                              >
                                {partner.name} - {partner.phone}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td
                          style={{
                            padding: '0.75rem',
                            color: 'var(--text-muted)',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {order.created_at
                            ? new Date(
                              order.created_at
                            ).toLocaleString('en-IN')
                            : '—'}
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <button
                            onClick={() => loadOrderDetails(order.id)}
                            style={{
                              background: '#dbeafe',
                              color: '#1d4ed8',
                              border: 'none',
                              padding: '0.45rem 0.75rem',
                              borderRadius: '7px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            View Items
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  {/* ORDER DETAILS PANEL */}
                  {selectedOrder && (
                    <div
                      style={{
                        marginTop: '1.5rem',
                        padding: '1.2rem',
                        border: '1px solid var(--border)',
                        borderRadius: '12px',
                        background: '#f8fafc'
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '1rem',
                          marginBottom: '1rem',
                          flexWrap: 'wrap'
                        }}
                      >
                        <div>
                          <h3
                            style={{
                              fontSize: '1.1rem',
                              fontWeight: 800,
                              marginBottom: '0.3rem'
                            }}
                          >
                            Order Details
                          </h3>

                          <p
                            style={{
                              color: 'var(--text-muted)',
                              fontSize: '0.85rem'
                            }}
                          >
                            {selectedOrder.order_number ||
                              `Order #${selectedOrder.id}`}
                          </p>
                        </div>

                        <button
                          onClick={() => {
                            setSelectedOrder(null);
                            setSelectedOrderItems([]);
                          }}
                          style={{
                            background: '#e5e7eb',
                            color: '#111827',
                            border: 'none',
                            padding: '0.5rem 0.8rem',
                            borderRadius: '7px',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          Close Details
                        </button>
                      </div>

                      {orderDetailsLoading ? (
                        <p style={{ color: 'var(--text-muted)' }}>
                          Loading ordered items...
                        </p>
                      ) : (
                        <>
                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns:
                                'repeat(auto-fit, minmax(180px, 1fr))',
                              gap: '0.8rem',
                              marginBottom: '1rem'
                            }}
                          >
                            <div>
                              <strong>Customer:</strong>
                              <div>
                                {selectedOrder.full_name || 'Customer'}
                              </div>
                            </div>

                            <div>
                              <strong>Phone:</strong>
                              <div>
                                {selectedOrder.phone || '—'}
                              </div>
                            </div>

                            <div>
                              <strong>Payment:</strong>
                              <div>
                                {(
                                  selectedOrder.payment_method || 'cod'
                                ).toUpperCase()}
                              </div>
                            </div>

                            <div>
                              <strong>Total:</strong>
                              <div>
                                ₹
                                {Number(
                                  selectedOrder.total_amount || 0
                                ).toFixed(2)}
                              </div>
                            </div>
                          </div>

                          <div
                            style={{
                              marginBottom: '1rem',
                              padding: '0.8rem',
                              background: 'white',
                              border: '1px solid var(--border)',
                              borderRadius: '8px'
                            }}
                          >
                            <strong>Delivery Address:</strong>

                            <div style={{ marginTop: '0.3rem' }}>
                              {selectedOrder.address_line || ''}
                              {selectedOrder.landmark
                                ? `, ${selectedOrder.landmark}`
                                : ''}
                              {selectedOrder.city
                                ? `, ${selectedOrder.city}`
                                : ''}
                              {selectedOrder.state
                                ? `, ${selectedOrder.state}`
                                : ''}
                              {selectedOrder.pincode
                                ? ` - ${selectedOrder.pincode}`
                                : ''}
                            </div>
                            {selectedOrder.latitude && selectedOrder.longitude && (
                              <div
                                style={{
                                  marginTop: '0.4rem',
                                  paddingTop: '0.4rem',
                                  borderTop: '1px dashed var(--border)',
                                  fontSize: '0.82rem',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.5rem',
                                  flexWrap: 'wrap'
                                }}
                              >
                                <span style={{ color: '#166534', fontWeight: 700 }}>
                                  📍 GPS: {Number(selectedOrder.latitude).toFixed(6)}, {Number(selectedOrder.longitude).toFixed(6)}
                                </span>
                                <a
                                  href={`https://www.google.com/maps?q=${selectedOrder.latitude},${selectedOrder.longitude}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    color: '#2563eb',
                                    fontWeight: 600,
                                    textDecoration: 'underline'
                                  }}
                                >
                                  View on Google Maps ↗
                                </a>
                              </div>
                            )}
                          </div>

                          <h4
                            style={{
                              fontSize: '1rem',
                              fontWeight: 800,
                              marginBottom: '0.7rem'
                            }}
                          >
                            Ordered Items
                          </h4>

                          {selectedOrderItems.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)' }}>
                              No ordered items found.
                            </p>
                          ) : (
                            <div style={{ overflowX: 'auto' }}>
                              <table
                                style={{
                                  width: '100%',
                                  minWidth: '650px',
                                  borderCollapse: 'collapse',
                                  textAlign: 'left',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                <thead>
                                  <tr
                                    style={{
                                      borderBottom:
                                        '2px solid var(--border)'
                                    }}
                                  >
                                    <th style={{ padding: '0.7rem' }}>
                                      Product
                                    </th>

                                    <th style={{ padding: '0.7rem' }}>
                                      Price
                                    </th>

                                    <th style={{ padding: '0.7rem' }}>
                                      Quantity
                                    </th>

                                    <th style={{ padding: '0.7rem' }}>
                                      Subtotal
                                    </th>
                                  </tr>
                                </thead>

                                <tbody>
                                  {selectedOrderItems.map((item) => (
                                    <tr
                                      key={item.id}
                                      style={{
                                        borderBottom:
                                          '1px solid var(--border)'
                                      }}
                                    >
                                      <td style={{ padding: '0.7rem' }}>
                                        {item.product_name}
                                      </td>

                                      <td style={{ padding: '0.7rem' }}>
                                        ₹
                                        {Number(
                                          item.price || 0
                                        ).toFixed(2)}
                                      </td>

                                      <td style={{ padding: '0.7rem' }}>
                                        {item.quantity}
                                      </td>

                                      <td
                                        style={{
                                          padding: '0.7rem',
                                          fontWeight: 700
                                        }}
                                      >
                                        ₹
                                        {Number(
                                          item.subtotal || 0
                                        ).toFixed(2)}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </table>
              </div>
            )}
          </div>
        )}

        {/* ===================================== */}
        {/* DELIVERY PARTNERS MANAGEMENT          */}
        {/* ===================================== */}
        {activeTab === 'deliveryPartners' && (
          <div className="table-card">

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '1.2rem',
                flexWrap: 'wrap'
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: '1.3rem',
                    fontWeight: 800,
                    marginBottom: '0.3rem'
                  }}
                >
                  Delivery Partners
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Add, edit and manage delivery partner accounts
                </p>
              </div>

              <button
                onClick={openAddDpForm}
                style={{
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  padding: '0.7rem 1rem',
                  borderRadius: '8px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                + Add Delivery Partner
              </button>
            </div>

            {/* ERROR MESSAGE */}
            {dpError && (
              <div
                style={{
                  background: '#fee2e2',
                  color: '#b91c1c',
                  padding: '0.8rem',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  fontSize: '0.85rem'
                }}
              >
                {dpError}
              </div>
            )}

            {/* ADD / EDIT FORM */}
            {showDpForm && (
              <form
                onSubmit={handleDpSubmit}
                style={{
                  background: '#f8fafc',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '1rem',
                  marginBottom: '1.5rem'
                }}
              >
                <h3
                  style={{
                    fontSize: '1rem',
                    fontWeight: 800,
                    marginBottom: '1rem'
                  }}
                >
                  {editingDp ? 'Edit Delivery Partner' : 'Add New Delivery Partner'}
                </h3>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '1rem'
                  }}
                >
                  {/* NAME */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={dpName}
                      onChange={(e) => setDpName(e.target.value)}
                      placeholder="e.g. Raj Kumar"
                      style={{ width: '100%', padding: '0.65rem', border: '1px solid var(--border)', borderRadius: '8px' }}
                    />
                  </div>

                  {/* EMAIL */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={dpEmail}
                      onChange={(e) => setDpEmail(e.target.value)}
                      placeholder="e.g. raj@FastDelivery.com"
                      style={{ width: '100%', padding: '0.65rem', border: '1px solid var(--border)', borderRadius: '8px' }}
                    />
                  </div>

                  {/* PHONE */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                      Phone *
                    </label>
                    <input
                      type="text"
                      required
                      value={dpPhone}
                      onChange={(e) => setDpPhone(e.target.value)}
                      placeholder="e.g. +1-555-0201"
                      style={{ width: '100%', padding: '0.65rem', border: '1px solid var(--border)', borderRadius: '8px' }}
                    />
                  </div>

                  {/* PASSWORD */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                      {editingDp ? 'New Password (leave blank to keep existing)' : 'Password *'}
                    </label>
                    <input
                      type="password"
                      required={!editingDp}
                      value={dpPassword}
                      onChange={(e) => setDpPassword(e.target.value)}
                      placeholder={editingDp ? 'Leave blank to keep existing password' : 'Enter password'}
                      style={{ width: '100%', padding: '0.65rem', border: '1px solid var(--border)', borderRadius: '8px' }}
                    />
                  </div>

                  {/* VEHICLE TYPE */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                      Vehicle Type
                    </label>
                    <select
                      value={dpVehicleType}
                      onChange={(e) => setDpVehicleType(e.target.value)}
                      style={{ width: '100%', padding: '0.65rem', border: '1px solid var(--border)', borderRadius: '8px' }}
                    >
                      <option value="bicycle">Bicycle</option>
                      <option value="motorcycle">Motorcycle</option>
                      <option value="car">Car</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* VEHICLE NUMBER */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                      Vehicle Number
                    </label>
                    <input
                      type="text"
                      value={dpVehicleNumber}
                      onChange={(e) => setDpVehicleNumber(e.target.value)}
                      placeholder="e.g. MH-01-AB-1234"
                      style={{ width: '100%', padding: '0.65rem', border: '1px solid var(--border)', borderRadius: '8px' }}
                    />
                  </div>

                  {/* STATUS */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                      Status
                    </label>
                    <select
                      value={dpStatus}
                      onChange={(e) => setDpStatus(e.target.value)}
                      style={{ width: '100%', padding: '0.65rem', border: '1px solid var(--border)', borderRadius: '8px' }}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                </div>

                {/* FORM BUTTONS */}
                <div style={{ display: 'flex', gap: '0.7rem', marginTop: '1rem' }}>
                  <button
                    type="submit"
                    disabled={dpSaving}
                    style={{
                      background: dpSaving ? '#93c5fd' : '#2563eb',
                      color: 'white',
                      border: 'none',
                      padding: '0.65rem 1rem',
                      borderRadius: '8px',
                      fontWeight: 700,
                      cursor: dpSaving ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {dpSaving ? 'Saving...' : (editingDp ? 'Update Partner' : 'Create Partner')}
                  </button>

                  <button
                    type="button"
                    onClick={resetDpForm}
                    style={{
                      background: '#e5e7eb',
                      color: '#111827',
                      border: 'none',
                      padding: '0.65rem 1rem',
                      borderRadius: '8px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* PARTNER LIST TABLE */}
            {dpLoading ? (
              <p style={{ color: 'var(--text-muted)' }}>Loading delivery partners...</p>
            ) : dpList.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No delivery partners found. Click "+ Add Delivery Partner" to create one.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    textAlign: 'left',
                    fontSize: '0.9rem'
                  }}
                >
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '0.75rem' }}>Name</th>
                      <th style={{ padding: '0.75rem' }}>Phone</th>
                      <th style={{ padding: '0.75rem' }}>Email</th>
                      <th style={{ padding: '0.75rem' }}>Status</th>
                      <th style={{ padding: '0.75rem' }}>Vehicle</th>
                      <th style={{ padding: '0.75rem' }}>Joined</th>
                      <th style={{ padding: '0.75rem' }}>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {dpList.map((dp) => (
                      <tr
                        key={dp.id}
                        style={{ borderBottom: '1px solid var(--border)' }}
                      >
                        <td style={{ padding: '0.75rem', fontWeight: 700 }}>
                          {dp.name}
                        </td>

                        <td style={{ padding: '0.75rem' }}>
                          {dp.phone || '—'}
                        </td>

                        <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>
                          {dp.email || '—'}
                        </td>

                        <td style={{ padding: '0.75rem' }}>
                          <span
                            style={{
                              background:
                                dp.status === 'active' ? '#d1fae5'
                                  : dp.status === 'suspended' ? '#fef9c3'
                                    : '#fee2e2',
                              color:
                                dp.status === 'active' ? '#047857'
                                  : dp.status === 'suspended' ? '#92400e'
                                    : '#b91c1c',
                              padding: '0.25rem 0.6rem',
                              borderRadius: '12px',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              textTransform: 'capitalize'
                            }}
                          >
                            {dp.status || 'active'}
                          </span>
                        </td>

                        <td style={{ padding: '0.75rem' }}>
                          <span style={{ textTransform: 'capitalize' }}>
                            {dp.vehicle_type || '—'}
                          </span>
                          {dp.vehicle_number && (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block' }}>
                              {dp.vehicle_number}
                            </span>
                          )}
                        </td>

                        <td style={{ padding: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                          {dp.created_at
                            ? new Date(dp.created_at).toLocaleDateString('en-IN')
                            : '—'}
                        </td>

                        <td style={{ padding: '0.75rem' }}>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              onClick={() => openEditDpForm(dp)}
                              style={{
                                padding: '0.5rem 0.75rem',
                                background: '#2563eb',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: 700
                              }}
                            >
                              Edit
                            </button>

                            <button
                              onClick={() => handleDeleteDp(dp.id)}
                              style={{
                                padding: '0.5rem 0.75rem',
                                background: '#dc2626',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: 700
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        )}

        {/* ============================================================
            PROMOTIONAL BANNERS MANAGEMENT TAB
            ============================================================ */}
        {activeTab === 'banners' && (
          <div>
            {/* Header & Add Banner Trigger */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem',
                flexWrap: 'wrap',
                gap: '1rem'
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    color: 'var(--text-main)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <ImageIcon size={26} color="#0891b2" />
                  Homepage Promotional Banners
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
                  Manage the promotional carousel banners sliding automatically above the homepage hero section.
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenAddBanner}
                style={{
                  background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.4rem',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 12px rgba(8, 145, 178, 0.25)'
                }}
              >
                <Plus size={18} />
                <span>Add New Banner</span>
              </button>
            </div>

            {/* Active Banner Capacity Badge */}
            <div
              style={{
                background: '#ecfeff',
                border: '1px solid #cffafe',
                borderRadius: '12px',
                padding: '1rem 1.25rem',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Sparkles size={22} color="#0891b2" />
                <div>
                  <div style={{ fontWeight: 800, color: '#164e63', fontSize: '0.95rem' }}>
                    Active Carousel Banners: {banners.filter(b => b.status === 'active').length} / 5
                  </div>
                  <div style={{ color: '#0e7490', fontSize: '0.85rem' }}>
                    Up to 5 active banners will automatically slide on the customer homepage in their saved display order.
                  </div>
                </div>
              </div>

              {banners.filter(b => b.status === 'active').length >= 5 ? (
                <span
                  style={{
                    background: '#fef3c7',
                    color: '#92400e',
                    padding: '0.35rem 0.8rem',
                    borderRadius: '20px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    border: '1px solid #fde68a'
                  }}
                >
                  Carousel Full (5/5)
                </span>
              ) : (
                <span
                  style={{
                    background: '#dcfce7',
                    color: '#166534',
                    padding: '0.35rem 0.8rem',
                    borderRadius: '20px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    border: '1px solid #bbf7d0'
                  }}
                >
                  Slots Available ({5 - banners.filter(b => b.status === 'active').length} remaining)
                </span>
              )}
            </div>

            {/* Alerts */}
            {bannerError && (
              <div
                style={{
                  background: '#fee2e2',
                  border: '1px solid #fecaca',
                  color: '#991b1b',
                  padding: '0.85rem 1.25rem',
                  borderRadius: '10px',
                  marginBottom: '1.5rem',
                  fontSize: '0.9rem',
                  fontWeight: 600
                }}
              >
                ⚠️ {bannerError}
              </div>
            )}

            {bannerSuccess && (
              <div
                style={{
                  background: '#dcfce7',
                  border: '1px solid #bbf7d0',
                  color: '#166534',
                  padding: '0.85rem 1.25rem',
                  borderRadius: '10px',
                  marginBottom: '1.5rem',
                  fontSize: '0.9rem',
                  fontWeight: 600
                }}
              >
                ✅ {bannerSuccess}
              </div>
            )}

            {/* Modal / Form for Add & Edit Banner */}
            {showBannerForm && (
              <div
                style={{
                  background: 'white',
                  border: '1px solid #cffafe',
                  borderRadius: '16px',
                  padding: '1.75rem',
                  marginBottom: '2rem',
                  boxShadow: '0 10px 25px -5px rgba(8, 145, 178, 0.12)'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1.5rem',
                    borderBottom: '1px solid var(--border)',
                    paddingBottom: '1rem'
                  }}
                >
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    {editingBanner ? 'Edit Promotional Banner' : 'Create New Promotional Banner'}
                  </h3>
                  <button
                    type="button"
                    onClick={resetBannerForm}
                    style={{
                      background: '#f1f5f9',
                      color: '#64748b',
                      border: 'none',
                      padding: '0.4rem 0.8rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 700
                    }}
                  >
                    Cancel
                  </button>
                </div>

                <form onSubmit={handleBannerSubmit}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
                    {/* Title */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                        Banner Title *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Farm Fresh Organics"
                        value={bannerTitle}
                        onChange={(e) => setBannerTitle(e.target.value)}
                        required
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          borderRadius: '8px',
                          border: '1px solid var(--border)',
                          fontSize: '0.9rem'
                        }}
                      />
                    </div>

                    {/* Button Text */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                        Button Text (optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Shop Now"
                        value={bannerButtonText}
                        onChange={(e) => setBannerButtonText(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          borderRadius: '8px',
                          border: '1px solid var(--border)',
                          fontSize: '0.9rem'
                        }}
                      />
                    </div>

                    {/* Destination Route / URL */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                        Destination URL / Route
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. /products?category=Fruits & Vegetables"
                        value={bannerLinkUrl}
                        onChange={(e) => setBannerLinkUrl(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          borderRadius: '8px',
                          border: '1px solid var(--border)',
                          fontSize: '0.9rem'
                        }}
                      />
                    </div>

                    {/* Status */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                        Status
                      </label>
                      <select
                        value={bannerStatus}
                        onChange={(e) => setBannerStatus(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          borderRadius: '8px',
                          border: '1px solid var(--border)',
                          fontSize: '0.9rem',
                          background: 'white'
                        }}
                      >
                        <option value="active">Active (Show in Homepage Carousel)</option>
                        <option value="inactive">Inactive (Hidden from Customers)</option>
                      </select>
                    </div>
                  </div>

                  {/* Description */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                      Subtitle / Description (optional)
                    </label>
                    <textarea
                      placeholder="e.g. Crisp vegetables and sweet fruits picked daily with freshness guaranteed."
                      value={bannerDescription}
                      onChange={(e) => setBannerDescription(e.target.value)}
                      rows={2}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        border: '1px solid var(--border)',
                        fontSize: '0.9rem',
                        fontFamily: 'inherit'
                      }}
                    />
                  </div>

                  {/* Image / GIF Upload Section */}
                  <div
                    style={{
                      border: '2px dashed #0891b2',
                      borderRadius: '12px',
                      padding: '1.5rem',
                      background: '#f0fdfa',
                      marginBottom: '1.5rem',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ marginBottom: '0.75rem' }}>
                      <ImageIcon size={36} color="#0891b2" style={{ margin: '0 auto' }} />
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.25rem', color: '#164e63' }}>
                      {bannerImagePreview ? 'Replace Banner Image or Animated GIF' : 'Upload Banner Image or Animated GIF'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#0e7490', marginBottom: '1rem' }}>
                      Supported formats: JPG, PNG, WebP, and animated GIF (Max file size: 5MB).
                      Recommended resolution: 1280 × 380 px.
                    </div>

                    <input
                      id="banner-image-file-input"
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handleBannerImageFileChange}
                      style={{ display: 'none' }}
                    />

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
                      <label
                        htmlFor="banner-image-file-input"
                        style={{
                          background: '#0891b2',
                          color: 'white',
                          padding: '0.6rem 1.25rem',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          display: 'inline-block'
                        }}
                      >
                        Choose File from Computer
                      </label>

                      {bannerImageFile && (
                        <button
                          type="button"
                          onClick={handleRemoveBannerImageFile}
                          style={{
                            background: '#fee2e2',
                            color: '#b91c1c',
                            border: 'none',
                            padding: '0.6rem 1rem',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 700,
                            fontSize: '0.85rem'
                          }}
                        >
                          Remove Selected File
                        </button>
                      )}
                    </div>

                    {bannerImageFile && (
                      <div style={{ marginTop: '0.75rem', fontSize: '0.82rem', color: '#164e63', fontWeight: 600 }}>
                        Selected: {bannerImageFile.name} ({(bannerImageFile.size / 1024).toFixed(1)} KB)
                      </div>
                    )}
                  </div>

                  {/* Live Mockup Preview */}
                  {bannerImagePreview && (
                    <div style={{ marginBottom: '1.5rem' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: '#164e63' }}>
                        Live Carousel Preview (As Seen by Customers):
                      </label>

                      <div
                        style={{
                          width: '100%',
                          height: '240px',
                          borderRadius: '16px',
                          position: 'relative',
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'center',
                          padding: '2rem',
                          boxShadow: '0 6px 18px rgba(8, 145, 178, 0.2)'
                        }}
                      >
                        <img
                          src={bannerImagePreview}
                          alt="Banner Preview"
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            zIndex: 1
                          }}
                        />

                        <div
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            background: 'linear-gradient(90deg, rgba(15, 23, 42, 0.84) 0%, rgba(14, 116, 144, 0.65) 55%, rgba(6, 182, 212, 0.25) 100%)',
                            zIndex: 2
                          }}
                        />

                        <div style={{ position: 'relative', zIndex: 3, maxWidth: '480px', color: 'white' }}>
                          <span
                            style={{
                              background: 'rgba(255, 255, 255, 0.22)',
                              padding: '0.25rem 0.75rem',
                              borderRadius: '20px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              display: 'inline-block',
                              marginBottom: '0.5rem',
                              border: '1px solid rgba(255, 255, 255, 0.3)'
                            }}
                          >
                            Special Promotion
                          </span>
                          <h4 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.4rem', lineHeight: 1.2 }}>
                            {bannerTitle || 'Your Banner Title'}
                          </h4>
                          {bannerDescription && (
                            <p style={{ fontSize: '0.85rem', opacity: 0.95, marginBottom: '0.8rem', lineHeight: 1.4 }}>
                              {bannerDescription}
                            </p>
                          )}
                          {bannerButtonText && (
                            <span
                              style={{
                                background: 'white',
                                color: '#164e63',
                                fontWeight: 800,
                                padding: '0.5rem 1.1rem',
                                borderRadius: '20px',
                                fontSize: '0.85rem',
                                display: 'inline-block'
                              }}
                            >
                              {bannerButtonText} →
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                    <button
                      type="button"
                      onClick={resetBannerForm}
                      style={{
                        padding: '0.75rem 1.25rem',
                        background: '#f1f5f9',
                        color: '#475569',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={bannerSaving || bannerImageUploading}
                      style={{
                        padding: '0.75rem 1.75rem',
                        background: bannerSaving || bannerImageUploading ? '#94a3b8' : 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: 700,
                        cursor: bannerSaving || bannerImageUploading ? 'not-allowed' : 'pointer',
                        boxShadow: '0 4px 12px rgba(8, 145, 178, 0.25)'
                      }}
                    >
                      {bannerImageUploading
                        ? 'Uploading Media...'
                        : bannerSaving
                        ? 'Saving Banner...'
                        : editingBanner
                        ? 'Update Banner'
                        : 'Create Banner'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Banners Table Card */}
            <div className="table-card">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem',
                  flexWrap: 'wrap',
                  gap: '0.5rem'
                }}
              >
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  Configured Promotional Banners ({banners.length})
                </h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Use the Up/Down arrows to reorder display sequence.
                </span>
              </div>

              {bannerLoading ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Loading promotional banners...
                </div>
              ) : banners.length === 0 ? (
                <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <ImageIcon size={48} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
                  <p style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem' }}>No promotional banners found</p>
                  <p style={{ fontSize: '0.85rem', marginBottom: '1.25rem' }}>Click "Add New Banner" above to create your first promotional banner.</p>
                  <button
                    type="button"
                    onClick={handleOpenAddBanner}
                    style={{
                      background: '#0891b2',
                      color: 'white',
                      border: 'none',
                      padding: '0.6rem 1.25rem',
                      borderRadius: '8px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Add Banner
                  </button>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--border)', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '0.75rem', width: '90px' }}>Order</th>
                        <th style={{ padding: '0.75rem', width: '120px' }}>Preview</th>
                        <th style={{ padding: '0.75rem' }}>Title & Description</th>
                        <th style={{ padding: '0.75rem' }}>Button / Route</th>
                        <th style={{ padding: '0.75rem', width: '110px' }}>Status</th>
                        <th style={{ padding: '0.75rem', width: '160px', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {banners.map((b, index) => {
                        const isFirst = index === 0;
                        const isLast = index === banners.length - 1;

                        return (
                          <tr
                            key={b.id}
                            style={{
                              borderBottom: '1px solid var(--border)',
                              background: b.status === 'active' ? 'white' : '#f8fafc'
                            }}
                          >
                            {/* Order Controls */}
                            <td style={{ padding: '0.75rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <span style={{ fontWeight: 800, width: '20px', textAlign: 'center' }}>
                                  {index + 1}
                                </span>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                  <button
                                    type="button"
                                    onClick={() => handleMoveBanner(index, -1)}
                                    disabled={isFirst}
                                    title="Move banner up"
                                    style={{
                                      background: isFirst ? '#f1f5f9' : '#e2e8f0',
                                      color: isFirst ? '#cbd5e1' : '#1e293b',
                                      border: 'none',
                                      borderRadius: '4px',
                                      padding: '2px 4px',
                                      cursor: isFirst ? 'not-allowed' : 'pointer'
                                    }}
                                  >
                                    <ArrowUp size={12} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleMoveBanner(index, 1)}
                                    disabled={isLast}
                                    title="Move banner down"
                                    style={{
                                      background: isLast ? '#f1f5f9' : '#e2e8f0',
                                      color: isLast ? '#cbd5e1' : '#1e293b',
                                      border: 'none',
                                      borderRadius: '4px',
                                      padding: '2px 4px',
                                      cursor: isLast ? 'not-allowed' : 'pointer'
                                    }}
                                  >
                                    <ArrowDown size={12} />
                                  </button>
                                </div>
                              </div>
                            </td>

                            {/* Thumbnail */}
                            <td style={{ padding: '0.75rem' }}>
                              <img
                                src={b.image_url}
                                alt={b.title}
                                style={{
                                  width: '100px',
                                  height: '50px',
                                  objectFit: 'cover',
                                  borderRadius: '6px',
                                  border: '1px solid var(--border)'
                                }}
                              />
                            </td>

                            {/* Title & Description */}
                            <td style={{ padding: '0.75rem' }}>
                              <div style={{ fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.2rem' }}>
                                {b.title}
                              </div>
                              {b.description && (
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '320px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {b.description}
                                </div>
                              )}
                            </td>

                            {/* Button & Link */}
                            <td style={{ padding: '0.75rem' }}>
                              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0891b2' }}>
                                {b.button_text || 'None'}
                              </div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                {b.link_url || '/products'}
                              </div>
                            </td>

                            {/* Status Toggle */}
                            <td style={{ padding: '0.75rem' }}>
                              <button
                                type="button"
                                onClick={() => handleToggleBannerStatus(b)}
                                style={{
                                  background: b.status === 'active' ? '#dcfce7' : '#fee2e2',
                                  color: b.status === 'active' ? '#166534' : '#991b1b',
                                  border: `1px solid ${b.status === 'active' ? '#bbf7d0' : '#fecaca'}`,
                                  padding: '0.3rem 0.65rem',
                                  borderRadius: '20px',
                                  fontSize: '0.78rem',
                                  fontWeight: 800,
                                  cursor: 'pointer'
                                }}
                              >
                                {b.status === 'active' ? 'Active' : 'Inactive'}
                              </button>
                            </td>

                            {/* Actions */}
                            <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                <button
                                  type="button"
                                  onClick={() => handleEditBanner(b)}
                                  style={{
                                    padding: '0.45rem 0.75rem',
                                    background: '#ecfeff',
                                    color: '#0891b2',
                                    border: '1px solid #cffafe',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontWeight: 700,
                                    fontSize: '0.82rem'
                                  }}
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteBanner(b.id)}
                                  style={{
                                    padding: '0.45rem 0.75rem',
                                    background: '#fee2e2',
                                    color: '#b91c1c',
                                    border: '1px solid #fecaca',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontWeight: 700,
                                    fontSize: '0.82rem'
                                  }}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>


    </div>
  );
}