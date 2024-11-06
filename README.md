# **Moongchee-server**

![Version](https://img.shields.io/github/v/release/URECA-TEAM3/moongchee-server)
![Last Commit](https://img.shields.io/github/last-commit/URECA-TEAM3/moongchee-server)

> ### **뭉치** 프로젝트는 바쁜 일상 속에서도 반려동물을 사랑하는 현대인들을 위한 스마트한 반려동물 종합 케어 플랫폼입니다. 반려동물 용품 쇼핑몰과 검증된 펫시터 예약 서비스가 결합되어, 반려인들이 필요한 모든 서비스를 한 번에 이용할 수 있도록 돕습니다. 이제 반려동물 돌봄과 쇼핑을 한 곳에서 간편하게 해결할 수 있는 뭉치와 함께, 더 편리하고 즐거운 반려동물 라이프를 만나보세요!

## 주요 서비스

1. **반려동물 프로필 관리**
   - 반려동물의 이름, 나이, 견종, 성별, 중성화 여부, 사진 등을 등록 및 수정
2. **쇼핑몰 서비스**
   - 반려동물 용품을 카테고리별로 조회 및 구매
   - 장바구니 및 주문 결제 기능
   - 포인트 적립 및 사용 기능
3. **펫시터 예약 서비스**
   - 위치 기반으로 주변의 펫시터 추천 및 예약
   - 펫시터 등록, 수정, 삭제
   - 펫시터 예약 및 결제 기능
   - 예약 취소 및 내역 조회
4. **알림 기능**
   - 펫시터 예약 신청, 수락, 취소 알림 제공
5. **추가기능**
   - 소셜 로그인 (Google, Kakao)
   - 간편 결제 (토스페이먼츠)

---

## **Table of Contents**

- [Project Setup](#project-setup)
- [Tech Stack](#tech-stack)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)

---

## **Project Setup**

### **Prerequisites**

- **Node.js**
- **npm** (or **yarn**)
- **MySQL Database**

### **Installation**

1. **Clone the Repository**

   ```bash
   git clone https://github.com/URECA-TEAM3/moongchee-server.git
   cd moongchee-server
   ```

2. Install Dependencies
   ```bash
   npm install (or npm i)
   ```
3. Set Up Environment Variables

   Please contact one of our members to obtain the variables

4. Start the Server
   ```bash
   npm start
   ```
   The server should now be running at http://localhost:3000

## **Tech Stack**

- **Backend**: Node.js, Express
- **Database**: MySQL
- **Authentication**: OAuth, Social Login
- **Storage**: Firebase Storage
- **Payment Integration**: Toss Payments SDK
- **API**: Daum Postcode API (for address lookup)

## **API Endpoints**

### **Auth Routes**

- `POST /api/auth/google-login`
- `POST /api/auth/kakao-login`
- `POST /api/auth/refresh-token`
- `GET /api/auth/user-info`

### **Member Routes**

- `POST /api/members/signup`
- `POST /api/members/check-nickname`
- `POST /api/members/update-points`
- `POST /api/members/send-email-verification`
- `GET /api/members/point/:id`
- `PUT /api/members/update-profile`
- `PUT /api/members/update-profile-in-cart`

### **Petsitter Routes**

- `POST /api/petsitter/apply`
- `POST /api/petsitter/reservation/list`
- `POST /api/petsitter/reservation/add`
- `POST /api/petsitter/reservation/confirm`
- `POST /api/petsitter/reservation/cancel`
- `GET /api/petsitter/list`
- `GET /api/petsitter/sitter/detail`
- `GET /api/petsitter/reservation/detail/:id`
- `PUT /api/petsitter/sitter/update`

### **Pet Routes**

- `POST /api/pets/animal-register`
- `GET /api/pets/:id`
- `GET /api/pets/detail/:id`
- `PUT /api/pets/update-profile`
- `DELETE /api/pets/:id`

### **Product Routes**

- `POST /api/products/getByIds`
- `GET /api/products`
- `GET /api/products/popular-products`
- `GET /api/products/new-products`
- `GET /api/products/:id`

### **Payment Routes**

- `POST /api/payments`
- `POST /api/payments/confirm`
- `POST /api/payments/approve`
- `GET /api/payments/fail`

### **Cart Routes**

- `POST /api/cart`
- `POST /api/cart/pay`
- `POST /api/cart/save`
- `GET /api/cart/:user_id`
- `GET /api/cart/order/:id`
- `PUT /api/cart/refund-product`
- `DELETE /api/cart/:cart_id`

### **Notification Routes**

- `POST /api/notifications/save`
- `GET /api/notifications/:id`
- `PUT /api/notifications/delete-all`
