import { useState, useRef, useEffect } from 'react';
import { useFormik } from 'formik';
import { storesOptions } from './data/stores';
import { unitMeasureOptions } from './data/unitMeasures';
import { IProduct } from './interfaces/productInterfaces';
import { UnitMeasures } from './enum/unitMeasuresEnum';
import ProductDetails from './components/ProductDetails';
import ErrorValidation from './components/ErrorValidation';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Select from 'react-select';

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
  const [lastProduct, setLastProduct] = useState('');
  const [lastUnitMeasure, setLastUnitMeasure] = useState(0);
  const [productsToBuy, setProductsToBuy] = useState<IProduct[]>([]);

  useEffect(() => {
    if (localStorage.getItem('productsToBuyList'))
      setProductsToBuy(JSON.parse(localStorage.getItem('productsToBuyList')!));
  }, []);

  useEffect(() => {
    formik.setFieldValue('productName', lastProduct);
  }, [lastProduct]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      productName: lastProduct,
      storeName: storesOptions[0].value,
      productUrl: '',
      price: 0.0,
      quantity: 0,
      unitMeasure: UnitMeasures[lastUnitMeasure],
    },
    validate,
    onSubmit: (values, { resetForm }) => {
      saveLastProduct(values);
      addProductsList(values);
      resetForm();
    },
  });

  const addProductsList = (values: any) => {
    let newProduct = {
      productName: values?.productName || lastProduct,
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

  const saveLastProduct = (values: any) => {
    if (lastUnitMeasure) values.unitMeasure = lastUnitMeasure;

    setLastProduct(values.productName);
    setLastUnitMeasure(values.unitMeasure);
  };

  const handleAddToShopping = (product: any) => {
    setProductsToBuy([product, ...productsToBuy]);
    localStorage.setItem(
      'productsToBuyList',
      JSON.stringify([product, ...productsToBuy])
    );
  };

  const handleClearProductList = () => {
    setProductsList([]);
    setLastProduct('');
    setLastUnitMeasure(0);
    unitMeasureRef.current.setValue(unitMeasureOptions[0]);
  };

  return (
    <Container className='vh-100 py-5'>
      <Row className=''>
        <Col md={{ span: 12 }} className='mb-4 d-flex justify-content-end'>
          <Button
            variant='outline-secondary'
            type='submit'
            disabled={productsList.length < 1}
            onClick={() => handleClearProductList()}
          >
            Clear
          </Button>
        </Col>
        <Col md={{ span: 4 }}>
          <h1>New product</h1>
          <form onSubmit={formik.handleSubmit}>
            <div className='w-100 d-flex flex-column mb-3'>
              <label htmlFor='productName'>Product name</label>

              <div className='w-100 d-flex flex-column'>
                <input
                  id='productName'
                  name='productName'
                  type='text'
                  onChange={formik.handleChange}
                  value={formik.values.productName}
                />
                <ErrorValidation message={formik.errors.productName} />
              </div>
            </div>
            <div className='w-100 d-flex flex-column mb-3'>
              <label htmlFor='storeName'>Store</label>
              <Select
                ref={storesRef}
                className='basic-single'
                classNamePrefix='select'
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
                type='text'
                onChange={formik.handleChange}
                value={formik.values.productUrl}
              />
            </div>
            <div className='w-100 d-flex flex-column mb-3'>
              <label htmlFor='price'>Price</label>
              <input
                id='price'
                name='price'
                type='number'
                onChange={formik.handleChange}
                value={formik.values.price}
              />
              <ErrorValidation message={formik.errors.price} />
            </div>
            <div className='w-100 d-flex flex-column mb-3'>
              <label htmlFor='quantity'>Weight or units</label>
              <input
                id='quantity'
                name='quantity'
                type='number'
                onChange={formik.handleChange}
                value={formik.values.quantity}
              />
              <ErrorValidation message={formik.errors.quantity} />
            </div>
            <div>
              <label htmlFor='unitMeasure'>Unit of measure</label>
              <Select
                ref={unitMeasureRef}
                className='basic-single'
                classNamePrefix='select'
                defaultValue={unitMeasureOptions[0]}
                name='unitMeasure'
                options={unitMeasureOptions}
                onChange={(selectedUnitMeasure) =>
                  formik.setFieldValue(
                    'unitMeasure',
                    selectedUnitMeasure?.value
                  )
                }
              />
            </div>

            <Button variant='outline-primary' type='submit'>
              Add product
            </Button>
          </form>
        </Col>

        <Col md={{ span: 4 }} className='h-100'>
          <h1>Products</h1>
          <div className='overflow-scroll h-calc'>
            {productsList
              .sort((firstElement, secondElement) =>
                firstElement.priceUnitMeasure > secondElement.priceUnitMeasure
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
        </Col>

        <Col md={{ span: 4 }} className='h-100'>
          <h1>Shopping Cart</h1>
          <div className='overflow-scroll h-calc'>
            {productsToBuy.map((product, index) => (
              <ProductDetails
                product={product}
                key={index}
                showButton={false}
                onSelectProduct={handleAddToShopping}
              />
            ))}
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default App;
