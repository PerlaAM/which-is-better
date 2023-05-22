import { useState, useRef, useEffect } from 'react';
import { useFormik } from 'formik';
import CurrencyInput from 'react-currency-input-field';
import { storesOptions } from './data/stores';
import { unitMeasureOptions } from './data/unitMeasures';
import { IProduct } from './interfaces/productInterfaces';
import { formatter } from './components/utils/formatValue';
import ProductDetails from './components/ProductDetails';
import ErrorValidation from './components/ErrorValidation';
import ConfirmationModal from './components/ConfirmationModal';
import Header from './components/Header';
import Footer from './components/Footer';
import Select from 'react-select';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';

type Errors = {
  productName?: string;
  price?: string;
  quantity?: string;
};

const validate = (values: any) => {
  const errors: Errors = {};

  if (!values.productName) errors.productName = 'Required';
  if (!values.price) errors.price = 'Required';
  if (!values.quantity) errors.quantity = 'Required';

  return errors;
};

function App() {
  const storesRef: any = useRef(null);
  const unitMeasureRef: any = useRef(null);
  const [productsList, setProductsList] = useState<IProduct[]>([]);
  const [productsToBuy, setProductsToBuy] = useState<IProduct[]>([]);
  const [unitMeasures, setUnitMeasures] = useState(unitMeasureOptions);
  const [keepProduct, setKeepProduct] = useState({
    productName: '',
    storeName: storesOptions[0].value,
    unitMeasure: unitMeasureOptions[0].value,
  });
  const [showProductsList, setShowProductsList] = useState(false);
  const [showProductsToBuyModal, setShowProductsToBuyModal] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('productsToBuyList'))
      setProductsToBuy(
        JSON.parse(localStorage.getItem('productsToBuyList') || '{}')
      );
  }, []);

  useEffect(() => {}, [keepProduct]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      productName: keepProduct.productName,
      storeName: keepProduct.storeName,
      productUrl: '',
      price: 0.0,
      quantity: 0,
      unitMeasure: keepProduct.unitMeasure,
    },
    validate,
    onSubmit: (values, { resetForm }) => {
      saveFirstProduct(values);
      addProductsList(values);
      resetForm();
    },
  });

  const addProductsList = (values: any) => {
    let newProduct = {
      id: values?.productName + values?.quantity + Math.random(),
      productName: values?.productName,
      storeName: values?.storeName,
      productUrl: values?.productUrl,
      price: values?.price,
      quantity: values?.quantity,
      unitMeasure: values?.unitMeasure,
      quantityConverted: getQuantity(values?.unitMeasure, values?.quantity),
      priceUnitMeasure: getPrice(
        values?.unitMeasure,
        values?.quantity,
        values?.price
      ),
    };

    setProductsList([newProduct, ...productsList]);
  };

  const getQuantity = (unitMeasure: string, quantity: number): number => {
    if (unitMeasure === 'kg' || unitMeasure === 'l') {
      return quantity * 1000;
    } else {
      return quantity;
    }
  };

  const getPrice = (
    unitMeasure: string,
    quantity: number,
    price: number
  ): number => {
    if (unitMeasure === 'kg' || unitMeasure === 'l') {
      let quantityLittle = quantity * 1000;
      return price / quantityLittle;
    } else {
      return price / quantity;
    }
  };

  const saveFirstProduct = (values: any) => {
    let product = {
      productName: values.productName,
      storeName: values.storeName,
      unitMeasure: values.unitMeasure,
    };
    let unitMeasure = unitMeasureOptions.find(
      (unit) => unit.value === product?.unitMeasure
    );
    let unitMeasureTypes = unitMeasureOptions.filter(
      ({ type }) => type === unitMeasure?.type
    );

    setUnitMeasures(unitMeasureTypes);
    setKeepProduct(product);
  };

  const getTotalAmount = (): number => {
    let totalAmount = 0.0;

    productsToBuy.map((product) => {
      totalAmount += Number(product?.price);
    });
    return totalAmount;
  };

  const handleAddToShopping = (product: any) => {
    if (
      !productsToBuy.find(
        (productToBuy) =>
          productToBuy.price === product.price &&
          productToBuy.quantity === product.quantity &&
          productToBuy.productName === product.productName
      )
    ) {
      setProductsToBuy([product, ...productsToBuy]);
      localStorage.setItem(
        'productsToBuyList',
        JSON.stringify([product, ...productsToBuy])
      );
    }
  };

  const handleRemoveProduct = (product: any) => {
    setProductsToBuy((productsCart) =>
      productsCart.filter((productCart) => productCart.id !== product.id)
    );

    let productsCartList = JSON.parse(
      localStorage.getItem('productsToBuyList') || '{}'
    );
    productsCartList.splice(productsToBuy.indexOf(product), 1);
    localStorage.setItem('productsToBuyList', JSON.stringify(productsCartList));
  };

  const handleClearProductList = () => {
    setProductsList([]);
    setKeepProduct({
      productName: '',
      storeName: storesOptions[0].value,
      unitMeasure: unitMeasureOptions[0].value,
    });
    unitMeasureRef.current.setValue(unitMeasureOptions[0]);
    setUnitMeasures(unitMeasureOptions);
    storesRef.current.setValue(storesOptions[0]);
    handleCloseProductsList();
  };

  const handleClearShoppingCart = () => {
    setProductsToBuy([]);
    localStorage.removeItem('productsToBuyList');
    handleCloseProductsToBuyModal();
  };

  const handleShowProductsList = () => setShowProductsList(true);

  const handleCloseProductsList = () => setShowProductsList(false);

  const handleShowProductsToBuyModal = () => setShowProductsToBuyModal(true);

  const handleCloseProductsToBuyModal = () => setShowProductsToBuyModal(false);

  return (
    <section>
      <Header />
      <Container className='h-calc-header py-3'>
        <Row className='h-100'>
          <Col md={{ span: 4 }}>
            <div className='mb-4'>
              <h2 className='m-0 text-dark'>New product</h2>
            </div>
            <form onSubmit={formik.handleSubmit}>
              <div className='w-100 d-flex flex-column mb-3'>
                <label htmlFor='productName'>Product name</label>
                <div className='w-100 d-flex flex-column'>
                  <input
                    id='productName'
                    name='productName'
                    className='form-control'
                    autoComplete='off'
                    type='text'
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.productName || keepProduct.productName}
                  />
                  <ErrorValidation
                    message={formik.errors.productName}
                    touched={formik.touched.productName}
                  />
                </div>
              </div>
              <div className='w-100 d-flex flex-column mb-3'>
                <label htmlFor='storeName'>Store</label>
                <Select
                  ref={storesRef}
                  className='basic-single'
                  classNamePrefix='select'
                  theme={(theme) => ({
                    ...theme,
                    colors: {
                      ...theme.colors,
                      primary25: '#6ec4bc66',
                      primary: '#6ec4bc',
                    },
                  })}
                  styles={{
                    control: (base) => ({
                      ...base,
                      border: 'none',
                      background: '#6ec4bc3c',
                    }),
                  }}
                  defaultValue={storesOptions[0]}
                  name='storeName'
                  options={storesOptions}
                  onChange={(selectedStore) =>
                    formik.setFieldValue('storeName', selectedStore?.value)
                  }
                />
              </div>
              <div className='w-100 d-flex flex-column mb-3'>
                <label htmlFor='productUrl'>Product URL</label>
                <input
                  id='productUrl'
                  name='productUrl'
                  className='form-control'
                  autoComplete='off'
                  type='text'
                  onChange={formik.handleChange}
                  value={formik.values.productUrl}
                />
              </div>
              <div className='d-flex'>
                <div className='w-50 d-flex flex-column mb-3 me-'>
                  <label htmlFor='price'>Price</label>
                  <CurrencyInput
                    id='price'
                    name='price'
                    placeholder='$0.0'
                    className='form-control'
                    prefix={'$'}
                    value={formik.values.price}
                    onBlur={formik.handleBlur}
                    onValueChange={(value) => {
                      formik.setFieldValue('price', value);
                    }}
                  />

                  <ErrorValidation
                    message={formik.errors.price}
                    touched={formik.touched.price}
                  />
                </div>
                <div className='w-50 d-flex flex-column mb-3 ms-2'>
                  <label htmlFor='quantity'>Weight or pieces</label>
                  <input
                    id='quantity'
                    name='quantity'
                    className='form-control'
                    autoComplete='off'
                    type='number'
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.quantity}
                  />
                  <ErrorValidation
                    message={formik.errors.quantity}
                    touched={formik.touched.quantity}
                  />
                </div>
              </div>
              <div>
                <label htmlFor='unitMeasure'>Unit of measure</label>
                <Select
                  ref={unitMeasureRef}
                  className='basic-single'
                  classNamePrefix='select'
                  theme={(theme) => ({
                    ...theme,
                    colors: {
                      ...theme.colors,
                      primary25: '#6ec4bc66',
                      primary: '#6ec4bc',
                    },
                  })}
                  styles={{
                    control: (base) => ({
                      ...base,
                      border: 'none',
                      background: '#6ec4bc3c',
                    }),
                  }}
                  defaultValue={unitMeasureOptions[0]}
                  name='unitMeasure'
                  options={unitMeasures}
                  onChange={(selectedUnitMeasure) =>
                    formik.setFieldValue(
                      'unitMeasure',
                      selectedUnitMeasure?.value
                    )
                  }
                />
              </div>
              <div className='d-grid gap-2 mt-3'>
                <Button variant='primary' size='sm' type='submit'>
                  Add product
                </Button>
              </div>
            </form>
          </Col>

          <Col md={{ span: 4 }} className='h-100 border-start'>
            <div className='h-100 ptm-3'>
              <div className='d-flex justify-content-between mb-4'>
                <h2 className='m-0 text-dark'>Products</h2>
                <Button
                  variant='outline-secondary'
                  size='sm'
                  disabled={productsList.length < 1}
                  onClick={() => handleShowProductsList()}
                >
                  Clear
                </Button>
              </div>
              <div
                className={`overflow-scroll h-calc ${
                  productsList.length > 0 ? 'visible' : 'invisible'
                } `}
              >
                {productsList
                  .sort((firstElement, secondElement) =>
                    firstElement.priceUnitMeasure >
                    secondElement.priceUnitMeasure
                      ? 1
                      : -1
                  )
                  .map((product, index) => (
                    <ProductDetails
                      product={product}
                      key={index}
                      showButton={true}
                      onSelectProduct={handleAddToShopping}
                    />
                  ))}
              </div>
            </div>
          </Col>

          <Col md={{ span: 4 }} className='h-100 border-start'>
            <div className='h-100 ptm-3'>
              <div className='d-flex justify-content-between mb-4'>
                <h2 className='m-0 text-dark'>Shopping Cart</h2>
                <Button
                  variant='outline-secondary'
                  size='sm'
                  disabled={productsToBuy.length < 1}
                  onClick={() => handleShowProductsToBuyModal()}
                >
                  Clear
                </Button>
              </div>
              <div className='overflow-scroll h-calc-cart'>
                {productsToBuy
                  .sort((firstElement, secondElement) =>
                    firstElement.storeName > secondElement.storeName ? 1 : -1
                  )
                  .map((product, index) => (
                    <ProductDetails
                      product={product}
                      key={index}
                      showRemoveButton={true}
                      onSelectProduct={handleAddToShopping}
                      onRemoveProduct={handleRemoveProduct}
                    />
                  ))}
              </div>
              <div className='pt-3'>
                <p className='text-end m-0 fw-light'>
                  Quantity:
                  <span className='fw-semibold'> {productsToBuy.length}</span>
                </p>
                <p className='fs-3 fw-light m-0 text-end'>
                  Total:
                  <span className='fw-semibold ps-1'>
                    {formatter.format(getTotalAmount())}
                  </span>
                </p>
              </div>
            </div>
          </Col>
        </Row>
        <ConfirmationModal
          show={showProductsList}
          onAction={handleClearProductList}
          handleClose={handleCloseProductsList}
          title={'Clear products'}
          description={'Are you sure you want to empty the products?'}
        />
        <ConfirmationModal
          show={showProductsToBuyModal}
          onAction={handleClearShoppingCart}
          handleClose={handleCloseProductsToBuyModal}
          title={'Clear shoppingCart'}
          description={'Are you sure you want to empty shopping cart?'}
        />
      </Container>
      <Footer />
    </section>
  );
}

export default App;
