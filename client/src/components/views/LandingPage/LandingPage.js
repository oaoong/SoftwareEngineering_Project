import React, { useEffect, useState } from "react";
import axios from "axios";
import { Icon, Col, Card, Row, Carousel, Button } from "antd";
import Meta from "antd/lib/card/Meta";
import ImageSlider from "../../utils/ImageSlider";
import CheckBox from "./Sections/CheckBox";
import { category } from "./Sections/Datas";

function LandingPage() {
  const [Products, setProducts] = useState([]);
  const [Skip, setSkip] = useState(0);
  const [Limit, setLimit] = useState(8);
  const [PostSize, setPostSize] = useState(0);
  const [Filters, setFilters] = useState({
    category: [],
  });
  const [SearchTerm, setSearchTerm] = useState("");
  const [writerName, setwriterName] = useState([]);

  useEffect(() => {
    let body = {
      skip: Skip,
      limit: Limit,
    };

    getProducts(body);
  }, []);

  const getProducts = (body) => {
    axios.post("api/product/products", body).then((response) => {
      console.log(JSON.parse(response.data.product));
      if (response.status == 200) {
        console.log("필터상품", JSON.parse(response.data.product));
        if (body.loadMore) {
          setProducts([...Products, ...JSON.parse(response.data.product)]);
        } else {
          setProducts(JSON.parse(response.data.product));
        }
        setPostSize(response.data.postSize);
      } else {
        alert("상품을 가져오는 데 실패했습니다.");
      }
    });
  };

  const loadMoreHandler = () => {
    let skip = Skip + Limit;
    let body = {
      skip: skip,
      limit: Limit,
      loadMore: true,
    };

    getProducts(body);
    setSkip(skip);
  };

  const renderCards = Products.map((product, index) => {
    return (
      <Col lg={6} md={8} xs={24} key={index}>
        <Card
          className="card"
          cover={
            <a href={`/product/${product._id.$oid}`}>
              <ImageSlider images={product.images} />
            </a>
          }
        >
          <Meta
            style={{
              fontFamily: "Pretendard",
              paddingBottom: "5px",
              fontSize: "15px",
            }}
            title={product.title}
            description={`${product.price}원`}
          />
          <p style={{ fontFamily: "Pretendard" }}>{product.userName}</p>
        </Card>
      </Col>
    );
  });

  const showFilteredResults = (filters) => {
    let body = {
      skip: 0,
      limit: Limit,
      filters: filters,
    };
    console.log("filters", filters);
    getProducts(body);
    setSkip(0);
  };

  const handleFilters = (filters, category) => {
    const newFilters = { ...Filters };
    newFilters[category] = filters;

    showFilteredResults(newFilters);
    setFilters(newFilters);
  };

  // const updateSearchTerm = (newSearchTerm) => {
  //   let body = {
  //     skip: 0,
  //     limit: Limit,
  //     filters: Filters,
  //     searchTerm: newSearchTerm,
  //   };
  //   setSkip(0);
  //   setSearchTerm(newSearchTerm);
  //   getProducts(body);
  // };

  return (
    <div>
      <div style={{ width: "75%", margin: "3rem auto" }}>
        <div
          style={{
            textAlign: "center",
            fontFamily: "PretendardBold",
            fontSize: "20px",
            padding: "20px 0",
          }}
        >
          <h2>전체 상품</h2>
        </div>

        {/*Filter*/}
        <Row>
          <Col lg={12} xs={24}>
            {/*CheckBox*/}
            <CheckBox
              list={category}
              handleFilters={(filters) => handleFilters(filters, "category")}
            />
          </Col>
        </Row>
        <br />
        {/*Cards*/}

        <Row gutter={[16, 16]}>{renderCards}</Row>

        <br />
        {PostSize >= Limit && (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Button
              style={{ fontFamily: "pretendardBold" }}
              onClick={loadMoreHandler}
            >
              더보기
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default LandingPage;
