import React, { useEffect, useState } from "react";
import axios from "axios";
import ProductImage from "./Sections/ProductImage";
import ProductInfo from "./Sections/ProductInfo";
import { Row, Col } from "antd";
import { useSelector } from "react-redux";

function DetailProductPage(props) {
  const productId = props?.match.params.productId;

  const [Product, setProduct] = useState({});
  const [isMyProduct, setisMyProduct] = useState(false);
  const [writerName, setwriterName] = useState("");
  const currentUser = useSelector((state) => state.user);

  useEffect(() => {
    axios
      .get(`/api/product/products_by_id/${productId}`)
      .then((response) => {
        console.log("상품정보", JSON.parse(response.data.product));
        setProduct(JSON.parse(response.data.product));
      })
      .catch((err) => alert(err));

    currentUser.userData?._id == Product?.writer
      ? setisMyProduct(true)
      : setisMyProduct(false);
  }, [currentUser]);

  return (
    <div style={{ width: "100%", padding: "3rem 4rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          fontFamily: "pretendardBold",
          marginTop: "30px",
        }}
      >
        <h1>{Product.title}</h1>
      </div>
      <br />

      <Row gutter={[16, 16]}>
        <Col lg={10} sm={24}>
          {/* product image */}
          <ProductImage detail={Product} />
        </Col>
        <Col lg={4} sm={0}></Col>
        <Col lg={10} sm={24}>
          {/* product info */}
          <ProductInfo
            detail={Product}
            isMyProduct={isMyProduct}
            currentUser={currentUser.userData?._id}
          />
        </Col>
      </Row>
    </div>
  );
}

export default DetailProductPage;
