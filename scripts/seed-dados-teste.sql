-- ===========================================================
-- SEED: Dados de Teste - SH Semijoias
-- Gerado em: 2026-05-11
-- ATENÇÃO: Executar somente em ambiente de desenvolvimento
-- Pré-requisitos: migration SeedTiposProduto e AdminSeeder já executados
-- Todos os usuários usam a senha: Admin@12345
-- ===========================================================

BEGIN;

-- ============================================================
-- 1. USUÁRIOS
-- ============================================================
INSERT INTO usuario (
    id,
    user_name,
    normalized_user_name,
    email,
    normalized_email,
    email_confirmed,
    password_hash,
    security_stamp,
    concurrency_stamp,
    phone_number_confirmed,
    two_factor_enabled,
    lockout_enabled,
    access_failed_count,
    nome,
    data_cadastro,
    data_atualizacao
)
VALUES
    (
        gen_random_uuid(),
        'maria.silva',
        'MARIA.SILVA',
        'maria.silva@shsemijoias.com.br',
        'MARIA.SILVA@SHSEMIJOIAS.COM.BR',
        true,
        'AQAAAAIAAYagAAAAEElb6SdSamnSC5Ep+Ay8U19/O3fAKsojW2rYjoznLQXpLBfSP/uGkzJY0QQmsmqgdQ==',
        CAST(gen_random_uuid() AS text),
        CAST(gen_random_uuid() AS text),
        false,
        false,
        true,
        0,
        'Maria Silva',
        NOW(),
        NOW()
    ),
    (
        gen_random_uuid(),
        'joao.santos',
        'JOAO.SANTOS',
        'joao.santos@shsemijoias.com.br',
        'JOAO.SANTOS@SHSEMIJOIAS.COM.BR',
        true,
        'AQAAAAIAAYagAAAAEElb6SdSamnSC5Ep+Ay8U19/O3fAKsojW2rYjoznLQXpLBfSP/uGkzJY0QQmsmqgdQ==',
        CAST(gen_random_uuid() AS text),
        CAST(gen_random_uuid() AS text),
        false,
        false,
        true,
        0,
        'João Santos',
        NOW(),
        NOW()
    ),
    (
        gen_random_uuid(),
        'ana.costa',
        'ANA.COSTA',
        'ana.costa@shsemijoias.com.br',
        'ANA.COSTA@SHSEMIJOIAS.COM.BR',
        true,
        'AQAAAAIAAYagAAAAEElb6SdSamnSC5Ep+Ay8U19/O3fAKsojW2rYjoznLQXpLBfSP/uGkzJY0QQmsmqgdQ==',
        CAST(gen_random_uuid() AS text),
        CAST(gen_random_uuid() AS text),
        false,
        false,
        true,
        0,
        'Ana Costa',
        NOW(),
        NOW()
    ),
    (
        gen_random_uuid(),
        'pedro.oliveira',
        'PEDRO.OLIVEIRA',
        'pedro.oliveira@shsemijoias.com.br',
        'PEDRO.OLIVEIRA@SHSEMIJOIAS.COM.BR',
        true,
        'AQAAAAIAAYagAAAAEElb6SdSamnSC5Ep+Ay8U19/O3fAKsojW2rYjoznLQXpLBfSP/uGkzJY0QQmsmqgdQ==',
        CAST(gen_random_uuid() AS text),
        CAST(gen_random_uuid() AS text),
        false,
        false,
        true,
        0,
        'Pedro Oliveira',
        NOW(),
        NOW()
    ),
    (
        gen_random_uuid(),
        'carla.mendes',
        'CARLA.MENDES',
        'carla.mendes@shsemijoias.com.br',
        'CARLA.MENDES@SHSEMIJOIAS.COM.BR',
        true,
        'AQAAAAIAAYagAAAAEElb6SdSamnSC5Ep+Ay8U19/O3fAKsojW2rYjoznLQXpLBfSP/uGkzJY0QQmsmqgdQ==',
        CAST(gen_random_uuid() AS text),
        CAST(gen_random_uuid() AS text),
        false,
        false,
        true,
        0,
        'Carla Mendes',
        NOW(),
        NOW()
    ),
    (
        gen_random_uuid(),
        'lucas.ferreira',
        'LUCAS.FERREIRA',
        'lucas.ferreira@shsemijoias.com.br',
        'LUCAS.FERREIRA@SHSEMIJOIAS.COM.BR',
        true,
        'AQAAAAIAAYagAAAAEElb6SdSamnSC5Ep+Ay8U19/O3fAKsojW2rYjoznLQXpLBfSP/uGkzJY0QQmsmqgdQ==',
        CAST(gen_random_uuid() AS text),
        CAST(gen_random_uuid() AS text),
        false,
        false,
        true,
        0,
        'Lucas Ferreira',
        NOW(),
        NOW()
    );

-- ============================================================
-- 2. VÍNCULO USUÁRIO-PERFIL
-- ============================================================
INSERT INTO usuario_perfil (user_id, role_id)
SELECT u.id, (SELECT id FROM perfil WHERE name = 'Administrador')
FROM usuario u
WHERE u.user_name IN ('maria.silva', 'joao.santos');

INSERT INTO usuario_perfil (user_id, role_id)
SELECT u.id, (SELECT id FROM perfil WHERE name = 'Revendedor')
FROM usuario u
WHERE u.user_name IN ('ana.costa', 'pedro.oliveira', 'carla.mendes', 'lucas.ferreira');

-- ============================================================
-- 3. CLIENTES
-- ============================================================
INSERT INTO cliente (nome, telefone, email, cpf, data_cadastro, data_atualizacao)
VALUES
    ('Fernanda Lima',    '(11) 99001-1234', 'fernanda.lima@email.com',    NULL,          NOW(), NOW()),
    ('Roberto Alves',    '(21) 98765-4321', 'roberto.alves@email.com',    NULL,          NOW(), NOW()),
    ('Patrícia Souza',   '(31) 97654-3210', NULL,                         '12345678901', NOW(), NOW()),
    ('Marcos Rocha',     '(41) 96543-2109', 'marcos.rocha@email.com',     NULL,          NOW(), NOW()),
    ('Juliana Neves',    '(51) 95432-1098', 'juliana.neves@email.com',    NULL,          NOW(), NOW()),
    ('Rafael Campos',    '(61) 94321-0987', NULL,                         '98765432100', NOW(), NOW()),
    ('Beatriz Martins',  '(71) 93210-9876', 'beatriz.martins@email.com',  NULL,          NOW(), NOW()),
    ('Gustavo Pereira',  '(81) 92109-8765', 'gustavo.pereira@email.com',  NULL,          NOW(), NOW());

-- ============================================================
-- 4. PRODUTOS
-- ============================================================
INSERT INTO produto (id_tipo_produto, descricao, preco_compra, preco_venda_sugerido, data_cadastro, data_atualizacao)
VALUES
    (1, 'Brinco Argola Dourada',        15.00, 35.00, NOW(), NOW()),
    (1, 'Brinco Pérola Branca',         18.00, 45.00, NOW(), NOW()),
    (1, 'Brinco Coração Rosé',          12.00, 28.00, NOW(), NOW()),
    (2, 'Anel Solitário Prata',         22.00, 55.00, NOW(), NOW()),
    (2, 'Anel Ajustável Dourado',       18.00, 42.00, NOW(), NOW()),
    (2, 'Anel Pedra Verde',             25.00, 60.00, NOW(), NOW()),
    (3, 'Gargantilha Veneziana Dourada',30.00, 70.00, NOW(), NOW()),
    (3, 'Gargantilha Coração Prata',    28.00, 65.00, NOW(), NOW()),
    (3, 'Gargantilha Borboleta',        20.00, 48.00, NOW(), NOW()),
    (4, 'Pulseira Berloques Dourada',   35.00, 80.00, NOW(), NOW()),
    (4, 'Pulseira Fio Prata',           15.00, 38.00, NOW(), NOW()),
    (4, 'Pulseira Pedra Azul',          28.00, 65.00, NOW(), NOW());

-- ============================================================
-- 5. MALETAS
-- ============================================================
INSERT INTO maleta (id_usuario, descricao, data_cadastro, data_atualizacao)
VALUES
    ((SELECT id FROM usuario WHERE user_name = 'ana.costa'),      'Maleta Ana Costa',      NOW(), NOW()),
    ((SELECT id FROM usuario WHERE user_name = 'pedro.oliveira'), 'Maleta Pedro Oliveira', NOW(), NOW()),
    ((SELECT id FROM usuario WHERE user_name = 'carla.mendes'),   'Maleta Carla Mendes',   NOW(), NOW());

-- ============================================================
-- 6. ESTOQUE
-- Todos os 12 produtos no estoque geral (id_maleta = NULL)
-- Alguns produtos também distribuídos nas maletas
-- ============================================================

-- Estoque geral: todos os produtos
INSERT INTO estoque (id_produto, id_maleta, quantidade, data_atualizacao)
SELECT p.id, NULL,
    CASE p.descricao
        WHEN 'Brinco Argola Dourada'         THEN 30
        WHEN 'Brinco Pérola Branca'          THEN 25
        WHEN 'Brinco Coração Rosé'           THEN 0
        WHEN 'Anel Solitário Prata'          THEN 0
        WHEN 'Anel Ajustável Dourado'        THEN 15
        WHEN 'Anel Pedra Verde'              THEN 12
        WHEN 'Gargantilha Veneziana Dourada' THEN 18
        WHEN 'Gargantilha Coração Prata'     THEN 22
        WHEN 'Gargantilha Borboleta'         THEN 10
        WHEN 'Pulseira Berloques Dourada'    THEN 15
        WHEN 'Pulseira Fio Prata'            THEN 20
        WHEN 'Pulseira Pedra Azul'           THEN 14
        ELSE 0
    END,
    NOW()
FROM produto p;

-- Maleta Ana Costa
INSERT INTO estoque (id_produto, id_maleta, quantidade, data_atualizacao)
SELECT p.id, (SELECT id FROM maleta WHERE descricao = 'Maleta Ana Costa'), 10, NOW()
FROM produto p
WHERE p.descricao IN (
    'Anel Ajustável Dourado',
    'Anel Pedra Verde',
    'Gargantilha Veneziana Dourada'
);

-- Maleta Pedro Oliveira
INSERT INTO estoque (id_produto, id_maleta, quantidade, data_atualizacao)
SELECT p.id, (SELECT id FROM maleta WHERE descricao = 'Maleta Pedro Oliveira'), 8, NOW()
FROM produto p
WHERE p.descricao IN (
    'Gargantilha Coração Prata',
    'Gargantilha Borboleta'
);

-- Maleta Carla Mendes
INSERT INTO estoque (id_produto, id_maleta, quantidade, data_atualizacao)
SELECT p.id, (SELECT id FROM maleta WHERE descricao = 'Maleta Carla Mendes'), 9, NOW()
FROM produto p
WHERE p.descricao IN (
    'Pulseira Fio Prata',
    'Pulseira Pedra Azul'
);

COMMIT;
END;

-- ============================================================
-- VERIFICAÇÃO
-- ============================================================
-- SELECT 'usuario' AS tabela, COUNT(*) FROM usuario
-- UNION ALL SELECT 'cliente', COUNT(*) FROM cliente
-- UNION ALL SELECT 'produto', COUNT(*) FROM produto
-- UNION ALL SELECT 'maleta',  COUNT(*) FROM maleta
-- UNION ALL SELECT 'estoque', COUNT(*) FROM estoque;
-- Esperado: usuario >= 7, cliente = 8, produto = 12, maleta = 3, estoque = 19