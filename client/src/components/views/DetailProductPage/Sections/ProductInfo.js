import React, { useEffect, useState } from "react";
import { Button, Descriptions, Col } from "antd";
import axios from "axios";

function ProductInfo(props) {
  const [sold, setsold] = useState(false);
  const [myProduct, setmyProduct] = useState(false);
  const [productId, setproductId] = useState("");
  const [follow, setfollow] = useState(false);
  const [writerName, setwriterName] = useState("");
  useEffect(() => {
    setsold(props.detail.sold);
    setmyProduct(props.isMyProduct);
    setproductId(props.detail._id?.$oid);
    getFollow();
    console.log("props", props.detail.writer);
    axios
      .post("/api/product/getWriterName", { writerID: props.detail.writer })
      .then((response) => {
        setwriterName(response.data.writerName);
        console.log("response", response.data);
      });
  }, [props]);

  const getFollow = () => {
    axios
      .post(`/api/follow/`, {
        userFrom: props.currentUser,
        userTo: props.detail.writer,
      })
      .then((response) => {
        setfollow(response.data.follow);
      })
      .catch((err) => alert(err));
  };

  const clickChatHandler = () => {
    axios
      .post(`/api/product/setSold`, { id: props.detail._id.$oid })
      .then((response) => {
        setsold(response.data.sold);
      })
      .catch((err) => alert(err));
  };

  const clickFollowHandler = () => {
    axios
      .post(`/api/follow/followUser`, {
        userFrom: props.currentUser,
        userTo: props.detail.writer,
      })
      .then((response) => {
        console.log("팔로우", response);
        setfollow(response.data.follow);
      })
      .catch((err) => alert(err));
  };

  const renderButton = () => {
    if (myProduct) {
      return (
        <>
          <Col>
            <a href={`/productEdit/${productId}`}>
              <Button size="large" shape="round" type="primary">
                수정
              </Button>
            </a>
          </Col>
          <Col>
            <Button
              size="large"
              shape="round"
              type={sold ? "primary" : "danger"}
              onClick={clickChatHandler}
            >
              {sold ? "거래재개" : "거래종료"}
            </Button>
          </Col>
        </>
      );
    } else {
      return (
        <>
          <Col>
            <Button
              size="large"
              shape="round"
              type={follow ? "danger" : "primary"}
              onClick={clickFollowHandler}
            >
              {follow ? "팔로우 해제" : "팔로우"}
            </Button>
          </Col>
          <Col>
            <Button
              size="large"
              shape="round"
              type="primary"
              onClick={clickChatHandler}
              disabled={sold}
            >
              {sold ? "판매완료" : "거래하기"}
            </Button>
          </Col>
        </>
      );
    }
  };

  if (props.currentUser) {
  }
  return (
    <div
      style={{
        margin: "15% 0 0 0",
        fontFamily: "Pretendard",
      }}
    >
      <Descriptions title="Product Info">
        <Descriptions.Item label="Price">
          {props.detail.price}원
        </Descriptions.Item>
        <Descriptions.Item label="Sold">
          {sold ? "판매완료" : "판매중"}
        </Descriptions.Item>
        <Descriptions.Item label="writer">{writerName}</Descriptions.Item>
        <br />
        <Descriptions.Item label="Description">
          {props.detail.description}
        </Descriptions.Item>
      </Descriptions>
      <br />
      <br />
      <br />

      <div style={{ display: "flex", justifyContent: "center" }}>
        {props.currentUser ? (
          renderButton()
        ) : (
          <p style={{ fontSize: "20px", color: "red" }}>
            서비스 이용을 위해 로그인해주세요
          </p>
        )}
      </div>
    </div>
  );
}

export default ProductInfo;
