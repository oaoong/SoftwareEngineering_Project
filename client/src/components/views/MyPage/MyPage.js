import React, { useEffect, useState } from "react";
import axios from "axios";
import { Icon, Col, Card, Row, Carousel, Button } from "antd";
import Meta from "antd/lib/card/Meta";
import ImageSlider from "../../utils/ImageSlider";
import { useSelector } from "react-redux";

function MyPage() {
  const [Products, setProducts] = useState([]);
  const [Skip, setSkip] = useState(0);
  const [Limit, setLimit] = useState(8);
  const [PostSize, setPostSize] = useState(0);
  const currentUser = useSelector((state) => state.user);

  useEffect(() => {
    let body = {
      skip: Skip,
      limit: Limit,
      user: currentUser.userData?._id,
    };
    getProducts(body);
  }, [currentUser]);

  const getProducts = (body) => {
    axios.post("api/product/productsByUser", body).then((response) => {
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
      user: currentUser.userData?._id,
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
            style={{ fontFamily: "Pretendard" }}
            title={product.title}
            description={`${product.price}원`}
          />
          <p style={{ fontFamily: "Pretendard" }}>{product.userName}</p>
        </Card>
      </Col>
    );
  });

  return (
    { currentUser } && (
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
            <h2>내가 업로드한 상품</h2>
          </div>

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
    )
  );
}

export default MyPage;
