import React, { useState, useEffect } from "react";
import { Typography, Button, Form, Input } from "antd";
import FileUpload from "../../utils/FileUpload";
import Axios from "axios";

const { TextArea } = Input;

const categories = [
  { key: 1, value: "의류/뷰티" },
  { key: 2, value: "생활용품" },
  { key: 3, value: "디지털" },
  { key: 4, value: "잡화" },
];

function EditProductPage(props) {
  const productId = props?.match.params.productId;
  const [Title, setTitle] = useState("");
  const [Description, setDescription] = useState("");
  const [Price, setPrice] = useState(0);
  const [Category, setCategory] = useState(1);
  const [Images, setImages] = useState([]);

  useEffect(() => {
    Axios.post(`/api/product/getEditProduct/${productId}`).then((response) => {
      console.log(JSON.parse(response.data));
      if (response.status == 200) {
        setTitle(JSON.parse(response.data).title);
        setDescription(JSON.parse(response.data).description);
        setPrice(JSON.parse(response.data).price);
        setCategory(JSON.parse(response.data).category);
        setImages(JSON.parse(response.data).images);
      } else {
        alert("정보 불러오기 실패");
      }
    });
  }, []);

  const titleChangeHandler = (event) => {
    setTitle(event.currentTarget.value);
  };

  const descriptionChangeHandler = (event) => {
    setDescription(event.currentTarget.value);
  };

  const priceChangeHandler = (event) => {
    setPrice(event.currentTarget.value);
  };

  const CategoryChangeHandler = (event) => {
    setCategory(event.currentTarget.value);
  };

  const updateImages = (newImages) => {
    setImages(newImages);
  };

  const submitHandler = (event) => {
    if (!Title || !Description || !Price || !Category || !Images) {
      return alert("모든 값을 넣어주세요.");
    }

    // 서버에 채운 값들을 request로 보낸다.

    const body = {
      //로그인된 사람의 ID
      writer: props.user.userData._id,
      title: Title,
      description: Description,
      price: Price,
      images: Images,
      category: Category,
    };

    console.log("업로드 요청 정보", body);

    Axios.post(`/api/product/editProduct/${productId}`, body).then(
      (response) => {
        if (response.data.success) {
          alert("상품 수정 완료");
          props.history.push("/");
        } else {
          alert("상품 수정 실패");
        }
      }
    );
  };

  return (
    <div style={{ maxWidth: "700px", margin: "2rem auto" }}>
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h2>상품 업로드</h2>
      </div>
      <Form onSubmit={submitHandler}>
        {/*DropZone*/}

        <FileUpload refreshFunction={updateImages} currentImages={Images} />

        <br />
        <br />
        <label>상품명</label>
        <Input onChange={titleChangeHandler} value={Title} />
        <br />
        <br />
        <label>설명</label>
        <TextArea onChange={descriptionChangeHandler} value={Description} />
        <br />
        <br />
        <label>가격(원)</label>
        <Input type="number" onChange={priceChangeHandler} value={Price} />
        <br />
        <br />
        <select onChange={CategoryChangeHandler} value={Category}>
          {categories.map((item) => (
            <option key={item.key} value={item.key}>
              {item.value}
            </option>
          ))}
        </select>
        <br />
        <br />
        <Button type="submit" onClick={submitHandler}>
          확인
        </Button>
      </Form>
    </div>
  );
}

export default EditProductPage;
