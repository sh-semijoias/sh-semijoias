-- ===========================================================
-- SEED: Dados de Teste - SH Semijoias
-- Simula ~6 meses de operação, terminando na data base (ver PARÂMETROS).
-- ATENÇÃO: Executar somente em ambiente de desenvolvimento, em um banco
-- limpo com as migrations aplicadas. O AdminSeeder não é pré-requisito.
-- Todos os usuários usam a senha: Admin@12345
--
-- Cenários cobertos (pensados para os indicadores do dashboard):
-- - Produtos com popularidade bem desigual (curva ABC)
-- - Produtos descontinuados no meio do período, com sobra em estoque (sem giro)
-- - Produtos cadastrados e nunca vendidos
-- - Lançamentos cadastrados nos últimos meses
-- - Vendas da loja (estoque geral) e de revendedoras (maletas, com repasse)
-- - Picos sazonais (Dia das Mães, Dia dos Namorados, Black Friday, Natal)
-- - Vendas parceladas, parcelas em aberto e vendas canceladas
-- - O mesmo cliente cadastrado por duas revendedoras
--
-- Os valores são aleatórios com semente fixa: a mesma data base gera
-- sempre os mesmos dados, em qualquer dia em que o script for executado.
-- ===========================================================

BEGIN;

SELECT setseed(0.42);

-- ============================================================
-- PARÂMETROS
-- data_base: último dia da simulação. Trocar por CURRENT_DATE para que os
-- dados sempre terminem no dia da execução (os valores passam a variar).
-- ============================================================
CREATE TEMP TABLE tmp_parametro ON COMMIT DROP AS
SELECT DATE '2026-10-12' AS data_base;

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
    senha_provisoria_ativa,
    data_cadastro,
    data_atualizacao
)
SELECT
    gen_random_uuid(),
    u.user_name,
    UPPER(u.user_name),
    u.user_name || '@shsemijoias.com.br',
    UPPER(u.user_name || '@shsemijoias.com.br'),
    true,
    'AQAAAAIAAYagAAAAEElb6SdSamnSC5Ep+Ay8U19/O3fAKsojW2rYjoznLQXpLBfSP/uGkzJY0QQmsmqgdQ==',
    CAST(gen_random_uuid() AS text),
    CAST(gen_random_uuid() AS text),
    false,
    false,
    true,
    0,
    u.nome,
    false,
    (SELECT data_base FROM tmp_parametro) - 190,
    (SELECT data_base FROM tmp_parametro) - 190
FROM (VALUES
    ('maria.silva', 'Maria Silva'),
    ('joao.santos', 'João Santos'),
    ('ana.costa', 'Ana Costa'),
    ('pedro.oliveira', 'Pedro Oliveira'),
    ('carla.mendes', 'Carla Mendes'),
    ('lucas.ferreira', 'Lucas Ferreira')
) AS u(user_name, nome);

-- ============================================================
-- 2. VÍNCULO USUÁRIO-PERFIL
-- Os perfis normalmente são criados pelo AdminSeeder no startup da API.
-- ============================================================
INSERT INTO perfil (id, name, normalized_name, concurrency_stamp)
SELECT gen_random_uuid(), p.name, UPPER(p.name), CAST(gen_random_uuid() AS text)
FROM (VALUES ('Administrador'), ('Revendedor')) AS p(name)
WHERE NOT EXISTS (SELECT 1 FROM perfil WHERE normalized_name = UPPER(p.name));

INSERT INTO usuario_perfil (user_id, role_id)
SELECT u.id, (SELECT id FROM perfil WHERE name = 'Administrador')
FROM usuario u
WHERE u.user_name IN ('maria.silva', 'joao.santos');

INSERT INTO usuario_perfil (user_id, role_id)
SELECT u.id, (SELECT id FROM perfil WHERE name = 'Revendedor')
FROM usuario u
WHERE u.user_name IN ('ana.costa', 'pedro.oliveira', 'carla.mendes', 'lucas.ferreira');

-- ============================================================
-- 3. TIPOS DE PRODUTO (além dos 4 criados pela migration)
-- ============================================================
INSERT INTO tipo_produto (descricao, ativo)
VALUES
    ('Tornozeleira', true),
    ('Conjunto', true),
    ('Pingente', true),
    ('Piercing', true);

-- ============================================================
-- 4. CLIENTES
-- Clientes da loja pertencem a maria.silva; cada revendedora tem os seus.
-- Fernanda Lima e Patrícia Souza também estão cadastradas por uma segunda revendedora.
-- ============================================================
INSERT INTO cliente (nome, telefone, email, cpf, usuario_id, data_cadastro, data_atualizacao)
SELECT c.nome, c.telefone, c.email, c.cpf, u.id, p.data_base - 190, p.data_base - 190
FROM (VALUES
    ('Fernanda Lima', '(11) 99001-1234', 'fernanda.lima@email.com', NULL, 'ana.costa'),
    ('Roberto Alves', '(21) 98765-4321', 'roberto.alves@email.com', NULL, 'maria.silva'),
    ('Patrícia Souza', '(31) 97654-3210', NULL, '12345678901', 'pedro.oliveira'),
    ('Marcos Rocha', '(41) 96543-2109', 'marcos.rocha@email.com', NULL, 'maria.silva'),
    ('Juliana Neves', '(51) 95432-1098', 'juliana.neves@email.com', NULL, 'carla.mendes'),
    ('Rafael Campos', '(61) 94321-0987', NULL, '98765432100', 'lucas.ferreira'),
    ('Beatriz Martins', '(71) 93210-9876', 'beatriz.martins@email.com', NULL, 'maria.silva'),
    ('Gustavo Pereira', '(81) 92109-8765', 'gustavo.pereira@email.com', NULL, 'ana.costa'),
    ('Fernanda Lima', '(11) 99001-5678', 'fernanda.lima2@email.com', NULL, 'carla.mendes'),
    ('Patrícia Souza', '(31) 97654-8899', NULL, '12345678901', 'lucas.ferreira')
) AS c(nome, telefone, email, cpf, dono)
JOIN usuario u ON u.user_name = c.dono
CROSS JOIN tmp_parametro p;

CREATE TEMP TABLE tmp_cliente_base (nome text, dono text, cpf text) ON COMMIT DROP;

INSERT INTO tmp_cliente_base (nome, dono, cpf)
SELECT
    n.primeiro || ' ' || s.sobrenome,
    CASE
        WHEN n.ordem <= 11 THEN 'maria.silva'
        WHEN n.ordem <= 17 THEN 'ana.costa'
        WHEN n.ordem <= 24 THEN 'pedro.oliveira'
        WHEN n.ordem <= 30 THEN 'carla.mendes'
        ELSE 'lucas.ferreira'
    END,
    CASE WHEN n.ordem % 3 = 0 THEN LPAD((10000000000 + n.ordem * 7919)::text, 11, '0') END
FROM unnest(ARRAY[
    'Priscila', 'Simone', 'Cristina', 'Lúcia', 'Viviane', 'Rosana', 'Camila', 'Larissa',
    'Gabriela', 'Renata', 'Aline', 'Bruna', 'Débora', 'Eduarda', 'Flávia', 'Helena',
    'Isabela', 'Jéssica', 'Karina', 'Letícia', 'Mariana', 'Natália', 'Olívia', 'Paula',
    'Raquel', 'Sabrina', 'Tatiane', 'Vanessa', 'Yasmin', 'Amanda', 'Bianca', 'Carolina',
    'Daniela', 'Elaine', 'Fabiana', 'Giovana', 'Heloísa', 'Ingrid', 'Joana', 'Luana'
]) WITH ORDINALITY AS n(primeiro, ordem)
JOIN unnest(ARRAY[
    'Alves', 'Neves', 'Rocha', 'Martins', 'Campos', 'Pereira', 'Barbosa', 'Ribeiro',
    'Nunes', 'Cardoso', 'Teixeira', 'Moreira', 'Araújo', 'Melo', 'Correia', 'Pinto',
    'Lopes', 'Monteiro', 'Freitas', 'Barros', 'Duarte', 'Ramos', 'Farias', 'Vieira',
    'Castro', 'Moraes', 'Batista', 'Dias', 'Cunha', 'Machado', 'Gomes', 'Prado',
    'Reis', 'Sales', 'Matos', 'Pacheco', 'Fonseca', 'Siqueira', 'Brito', 'Coelho'
]) WITH ORDINALITY AS s(sobrenome, ordem_s) ON s.ordem_s = n.ordem
WHERE n.ordem <= 34;

INSERT INTO cliente (nome, telefone, email, cpf, usuario_id, data_cadastro, data_atualizacao)
SELECT
    b.nome,
    '(' || (11 + (ROW_NUMBER() OVER (ORDER BY b.nome, b.dono)) % 80) || ') 9'
        || LPAD(((ROW_NUMBER() OVER (ORDER BY b.nome, b.dono)) * 7349 % 10000)::text, 4, '0') || '-'
        || LPAD(((ROW_NUMBER() OVER (ORDER BY b.nome, b.dono)) * 3571 % 10000)::text, 4, '0'),
    LOWER(TRANSLATE(REPLACE(b.nome, ' ', '.'), 'áâãéêíóôúçÁÉÍÓÚ', 'aaaeeiooucAEIOU'))
        || '.' || SPLIT_PART(b.dono, '.', 1) || '@email.com',
    b.cpf,
    u.id,
    p.data_base - 190,
    p.data_base - 190
FROM tmp_cliente_base b
JOIN usuario u ON u.user_name = b.dono
CROSS JOIN tmp_parametro p;

-- ============================================================
-- 5. PRODUTOS
-- 12 produtos fixos + modelos gerados em 2 acabamentos (71 produtos no total)
-- ============================================================
CREATE TEMP TABLE tmp_catalogo (
    id_tipo_produto int,
    descricao text,
    preco_compra numeric,
    preco_venda_sugerido numeric
) ON COMMIT DROP;

INSERT INTO tmp_catalogo (id_tipo_produto, descricao, preco_compra, preco_venda_sugerido)
VALUES
    (1, 'Brinco Argola Dourada', 15.00, 35.00),
    (1, 'Brinco Pérola Branca', 18.00, 45.00),
    (1, 'Brinco Coração Rosé', 12.00, 28.00),
    (2, 'Anel Solitário Prata', 22.00, 55.00),
    (2, 'Anel Ajustável Dourado', 18.00, 42.00),
    (2, 'Anel Pedra Verde', 25.00, 60.00),
    (3, 'Gargantilha Veneziana Dourada', 30.00, 70.00),
    (3, 'Gargantilha Coração Prata', 28.00, 65.00),
    (3, 'Gargantilha Borboleta', 20.00, 48.00),
    (4, 'Pulseira Berloques Dourada', 35.00, 80.00),
    (4, 'Pulseira Fio Prata', 15.00, 38.00),
    (4, 'Pulseira Pedra Azul', 28.00, 65.00);

CREATE TEMP TABLE tmp_modelo (tipo text, modelo text, custo numeric) ON COMMIT DROP;

INSERT INTO tmp_modelo (tipo, modelo, custo)
VALUES
    ('Brinco', 'Brinco Argola Lisa', 14), ('Brinco', 'Brinco Argola Cravejada', 22), ('Brinco', 'Brinco Ponto de Luz', 12),
    ('Brinco', 'Brinco Pérola', 16), ('Brinco', 'Brinco Gota Zircônia', 24), ('Brinco', 'Brinco Ear Cuff', 18), ('Brinco', 'Brinco Coração', 11),
    ('Anel', 'Anel Solitário', 20), ('Anel', 'Anel Aparador', 15), ('Anel', 'Anel Ajustável', 13),
    ('Anel', 'Anel Meia Aliança', 26), ('Anel', 'Anel Pedra Natural', 28),
    ('Gargantilha', 'Gargantilha Veneziana', 24), ('Gargantilha', 'Gargantilha Ponto de Luz', 22), ('Gargantilha', 'Gargantilha Choker', 18),
    ('Gargantilha', 'Gargantilha Coração', 20), ('Gargantilha', 'Gargantilha Riviera', 38), ('Gargantilha', 'Gargantilha Escapulário', 30),
    ('Pulseira', 'Pulseira Riviera', 34), ('Pulseira', 'Pulseira Berloques', 32), ('Pulseira', 'Pulseira Elos', 22),
    ('Pulseira', 'Pulseira Fio Duplo', 16), ('Pulseira', 'Pulseira Bracelete', 36),
    ('Tornozeleira', 'Tornozeleira Bolinhas', 12), ('Tornozeleira', 'Tornozeleira Estrelas', 14),
    ('Conjunto', 'Conjunto Ponto de Luz', 30), ('Conjunto', 'Conjunto Pérolas', 36),
    ('Pingente', 'Pingente Inicial', 10), ('Pingente', 'Pingente Medalha', 14), ('Pingente', 'Pingente Cruz', 12),
    ('Piercing', 'Piercing Fake Argola', 8), ('Piercing', 'Piercing Fake Cravejado', 10);

-- Gargantilha, Pulseira e Tornozeleira são femininos: "Dourada"
INSERT INTO tmp_catalogo (id_tipo_produto, descricao, preco_compra, preco_venda_sugerido)
SELECT x.id_tipo_produto, x.descricao, x.preco_compra, CEIL(x.preco_compra * (2.2 + random() * 0.4)) - 0.10
FROM (
    SELECT
        tp.id AS id_tipo_produto,
        m.modelo || ' ' || CASE
            WHEN a.acabamento = 'Prata' THEN 'Prata'
            WHEN m.tipo IN ('Gargantilha', 'Pulseira', 'Tornozeleira') THEN 'Dourada'
            ELSE 'Dourado'
        END AS descricao,
        ROUND(m.custo * a.fator, 2) AS preco_compra
    FROM tmp_modelo m
    JOIN tipo_produto tp ON tp.descricao = m.tipo
    CROSS JOIN (VALUES ('Dourado', 1.0), ('Prata', 0.85)) AS a(acabamento, fator)
    ORDER BY tp.id, m.modelo, a.acabamento
) x
WHERE NOT EXISTS (SELECT 1 FROM tmp_catalogo c WHERE c.descricao = x.descricao);

-- Perfil de venda de cada produto, usado só pela simulação:
-- peso      → popularidade relativa (0 = nunca vendido)
-- inicio    → dia (0 a 182) em que o produto chega e começa a vender
-- fim       → último dia em que o produto vende (descontinuados param antes do fim)
-- demanda   → estimativa de unidades vendidas por dia, usada na reposição
CREATE TEMP TABLE tmp_produto (
    id int PRIMARY KEY,
    peso numeric,
    inicio int,
    fim int,
    demanda numeric
) ON COMMIT DROP;

DO $$
DECLARE
    v_dias CONSTANT int := 182;
    v_inicio_periodo CONSTANT date := (SELECT data_base FROM tmp_parametro) - 182;
    r record;
    v_id int;
    v_rank int := 0;
    v_peso numeric;
    v_inicio int;
    v_fim int;
    v_total_produtos int := (SELECT COUNT(*) FROM tmp_catalogo);
BEGIN
    FOR r IN
        SELECT c.id_tipo_produto, c.descricao, c.preco_compra, c.preco_venda_sugerido
        FROM tmp_catalogo c
        ORDER BY random()
    LOOP
        v_rank := v_rank + 1;
        v_peso := 1.0 / POWER(v_rank, 1.1);
        v_inicio := 0;
        v_fim := v_dias;

        -- 6 produtos nunca vendidos
        IF v_rank > v_total_produtos - 6 THEN
            v_peso := 0;
            v_inicio := (random() * 150)::int;
        -- 8 produtos descontinuados ao longo do período
        ELSIF v_rank IN (9, 14, 19, 24, 31, 37, 43, 50) THEN
            v_fim := (ARRAY[20, 35, 50, 65, 80, 95, 110, 125])[(v_rank % 8) + 1];
        -- 5 lançamentos nos últimos meses
        ELSIF v_rank IN (6, 17, 27, 40, 53) THEN
            v_inicio := (ARRAY[110, 125, 140, 150, 160])[(v_rank % 5) + 1];
        END IF;

        INSERT INTO produto (id_tipo_produto, descricao, preco_compra, preco_venda_sugerido, data_cadastro, data_atualizacao)
        VALUES (
            r.id_tipo_produto,
            r.descricao,
            r.preco_compra,
            r.preco_venda_sugerido,
            v_inicio_periodo + v_inicio - 3,
            v_inicio_periodo + v_inicio - 3
        )
        RETURNING id INTO v_id;

        INSERT INTO tmp_produto (id, peso, inicio, fim, demanda)
        VALUES (v_id, v_peso, v_inicio, v_fim, 0);
    END LOOP;

    -- ~1.700 unidades vendidas no período, distribuídas pelo peso
    UPDATE tmp_produto t
    SET demanda = CASE WHEN t.peso = 0 THEN 0 ELSE 1700.0 * t.peso / s.total / v_dias END
    FROM (SELECT SUM(peso) AS total FROM tmp_produto) s;
END $$;

-- ============================================================
-- 6. MALETAS
-- ============================================================
INSERT INTO maleta (id_usuario, descricao, data_cadastro, data_atualizacao)
SELECT u.id, 'Maleta ' || u.nome, p.data_base - 182, p.data_base - 182
FROM usuario u
CROSS JOIN tmp_parametro p
WHERE u.user_name IN ('ana.costa', 'pedro.oliveira', 'carla.mendes', 'lucas.ferreira');

-- ============================================================
-- 7. SIMULAÇÃO DIÁRIA
-- Para cada dia: chegada de lançamentos, reposição do estoque geral,
-- reabastecimento das maletas, vendas, recebimentos e cancelamentos.
-- ============================================================
DO $$
DECLARE
    v_dias CONSTANT int := 182;
    v_inicio_periodo CONSTANT date := (SELECT data_base FROM tmp_parametro) - 182;
    v_dia int;
    v_data date;
    v_fator numeric;
    v_lambda numeric;
    v_qtd_vendas int;
    v_p numeric;
    v_limite numeric;
    v_vendedor record;
    v_id_cliente int;
    v_id_venda int;
    v_data_venda timestamptz;
    v_tipo_pagamento int;
    v_parcelas int;
    v_qtd_itens int;
    v_item record;
    v_qtd int;
    v_preco numeric;
    v_total numeric;
    v_valor_parcela numeric;
    v_usados int[];
    v_cancelada boolean;
    v_vencimento timestamptz;
    v_id_parcela int;
    -- parcelas vencidas até o fim da data base podem estar pagas
    v_limite_recebimento CONSTANT timestamptz := ((SELECT data_base FROM tmp_parametro) + TIME '23:59:59') AT TIME ZONE 'America/Sao_Paulo';
    i int;
    j int;
BEGIN
    -- Estoque geral inicial: produtos disponíveis no início chegam com ~10 semanas de demanda
    INSERT INTO estoque (id_produto, id_maleta, quantidade, data_atualizacao)
    SELECT
        t.id,
        NULL,
        CASE
            WHEN t.inicio > 0 THEN 0
            WHEN t.peso = 0 THEN 4 + (random() * 8)::int
            WHEN t.fim < v_dias THEN CEIL(t.demanda * 120) + 6
            ELSE CEIL(t.demanda * 70) + 4
        END,
        v_inicio_periodo
    FROM tmp_produto t;

    -- Maletas iniciais: 18 produtos populares, 3 a 6 peças cada, retiradas do estoque geral
    FOR v_vendedor IN SELECT id FROM maleta LOOP
        INSERT INTO estoque (id_produto, id_maleta, quantidade, data_atualizacao)
        SELECT x.id, v_vendedor.id, LEAST(x.quantidade, 3 + (random() * 3)::int), v_inicio_periodo
        FROM (
            SELECT t.id, e.quantidade
            FROM tmp_produto t
            JOIN estoque e ON e.id_produto = t.id AND e.id_maleta IS NULL
            WHERE t.peso > 0
            AND t.inicio = 0
            AND e.quantidade > 0
            ORDER BY -LN(1 - random()) / t.peso
            LIMIT 18
        ) x;

        UPDATE estoque eg
        SET quantidade = eg.quantidade - em.quantidade
        FROM estoque em
        WHERE em.id_maleta = v_vendedor.id
        AND eg.id_produto = em.id_produto
        AND eg.id_maleta IS NULL;
    END LOOP;

    FOR v_dia IN 0..v_dias LOOP
        v_data := v_inicio_periodo + v_dia;

        -- Chegada de lançamentos
        UPDATE estoque e
        SET quantidade = e.quantidade + CEIL(t.demanda * 45) + 6,
            data_atualizacao = v_data
        FROM tmp_produto t
        WHERE e.id_produto = t.id
        AND e.id_maleta IS NULL
        AND t.inicio = v_dia
        AND v_dia > 0;

        -- Reposição quinzenal do estoque geral (só produtos ativos e com saída)
        IF v_dia % 14 = 7 THEN
            UPDATE estoque e
            SET quantidade = e.quantidade + CEIL(t.demanda * 45) + 3,
                data_atualizacao = v_data
            FROM tmp_produto t
            WHERE e.id_produto = t.id
            AND e.id_maleta IS NULL
            AND t.peso > 0
            AND v_dia >= t.inicio
            -- descontinuados deixam de ser repostos 30 dias antes de sair de linha
            AND (t.fim = v_dias OR v_dia <= t.fim - 30)
            AND e.quantidade < GREATEST(4, t.demanda * 21);
        END IF;

        -- Reabastecimento quinzenal das maletas: itens ativos com menos de 3 peças voltam a 5
        IF v_dia % 15 = 10 THEN
            FOR v_item IN
                SELECT em.id AS id_maleta_estoque, em.quantidade AS atual, eg.id AS id_geral
                FROM estoque em
                JOIN estoque eg ON eg.id_produto = em.id_produto AND eg.id_maleta IS NULL
                JOIN tmp_produto t ON t.id = em.id_produto
                WHERE em.id_maleta IS NOT NULL
                AND em.quantidade < 3
                AND v_dia BETWEEN t.inicio AND t.fim
                AND eg.quantidade > 0
            LOOP
                -- o saldo do estoque geral é relido porque várias maletas podem pedir o mesmo produto
                v_qtd := LEAST((SELECT quantidade FROM estoque WHERE id = v_item.id_geral), 5 - v_item.atual);
                CONTINUE WHEN v_qtd <= 0;
                UPDATE estoque SET quantidade = quantidade + v_qtd, data_atualizacao = v_data WHERE id = v_item.id_maleta_estoque;
                UPDATE estoque SET quantidade = quantidade - v_qtd, data_atualizacao = v_data WHERE id = v_item.id_geral;
            END LOOP;

            -- Lançamentos entram nas maletas que ainda não os têm
            FOR v_item IN
                SELECT t.id AS id_produto, m.id AS id_maleta, eg.id AS id_geral
                FROM tmp_produto t
                CROSS JOIN maleta m
                JOIN estoque eg ON eg.id_produto = t.id AND eg.id_maleta IS NULL
                WHERE t.inicio > 0
                AND t.peso > 0
                AND t.inicio <= v_dia
                AND NOT EXISTS (SELECT 1 FROM estoque e WHERE e.id_produto = t.id AND e.id_maleta = m.id)
            LOOP
                IF (SELECT quantidade FROM estoque WHERE id = v_item.id_geral) >= 6 THEN
                    INSERT INTO estoque (id_produto, id_maleta, quantidade, data_atualizacao)
                    VALUES (v_item.id_produto, v_item.id_maleta, 3, v_data);
                    UPDATE estoque SET quantidade = quantidade - 3, data_atualizacao = v_data WHERE id = v_item.id_geral;
                END IF;
            END LOOP;
        END IF;

        -- Sazonalidade: dia da semana, datas comemorativas e leve crescimento
        v_fator := CASE EXTRACT(ISODOW FROM v_data)
            WHEN 6 THEN 1.4
            WHEN 7 THEN 0.5
            ELSE 1.0
        END;
        IF EXTRACT(MONTH FROM v_data) = 5 AND EXTRACT(DAY FROM v_data) <= 10 THEN v_fator := v_fator * 1.8; END IF;
        IF EXTRACT(MONTH FROM v_data) = 6 AND EXTRACT(DAY FROM v_data) BETWEEN 5 AND 12 THEN v_fator := v_fator * 1.5; END IF;
        IF EXTRACT(MONTH FROM v_data) = 11 AND EXTRACT(DAY FROM v_data) >= 22 THEN v_fator := v_fator * 1.5; END IF;
        IF EXTRACT(MONTH FROM v_data) = 12 AND EXTRACT(DAY FROM v_data) <= 24 THEN v_fator := v_fator * 2.0; END IF;
        v_fator := v_fator * (1 + v_dia / 182.0 * 0.2);

        -- Vendedores: loja (administradores, estoque geral) e revendedoras (maleta)
        FOR v_vendedor IN
            SELECT u.id AS id_usuario, NULL::int AS id_maleta, 1.4 AS media
            FROM usuario u
            WHERE u.user_name = 'maria.silva'
            UNION ALL
            SELECT m.id_usuario, m.id, CASE u.user_name WHEN 'ana.costa' THEN 1.2 WHEN 'carla.mendes' THEN 1.0 WHEN 'pedro.oliveira' THEN 0.7 ELSE 0.5 END
            FROM maleta m
            JOIN usuario u ON u.id = m.id_usuario
        LOOP
            -- Quantidade de vendas do dia (Poisson)
            v_lambda := v_vendedor.media * v_fator;
            v_limite := EXP(-v_lambda);
            v_qtd_vendas := 0;
            v_p := random();
            WHILE v_p > v_limite LOOP
                v_qtd_vendas := v_qtd_vendas + 1;
                v_p := v_p * random();
            END LOOP;

            FOR i IN 1..v_qtd_vendas LOOP
                -- Cliente: alguns clientes compram bem mais que outros
                SELECT c.id INTO v_id_cliente
                FROM cliente c
                JOIN usuario u ON u.id = c.usuario_id
                WHERE (v_vendedor.id_maleta IS NULL AND u.user_name = 'maria.silva')
                OR (v_vendedor.id_maleta IS NOT NULL AND c.usuario_id = v_vendedor.id_usuario)
                ORDER BY -LN(1 - random()) / (0.5 + c.id * 7 % 11)
                LIMIT 1;

                v_data_venda := (v_data + TIME '09:00' + random() * INTERVAL '11 hours') AT TIME ZONE 'America/Sao_Paulo';
                v_p := random();
                v_tipo_pagamento := CASE WHEN v_p < 0.40 THEN 2 WHEN v_p < 0.70 THEN 3 WHEN v_p < 0.85 THEN 1 ELSE 4 END;
                v_parcelas := CASE
                    WHEN v_tipo_pagamento <> 3 THEN 1
                    ELSE (ARRAY[1, 1, 2, 2, 3, 3, 4, 5, 6])[1 + (random() * 8)::int]
                END;

                INSERT INTO venda (id_cliente, id_usuario, id_tipo_pagamento, total_parcelas, comentario, data_venda, data_atualizacao)
                VALUES (
                    v_id_cliente,
                    -- vendas da loja são registradas pelos dois administradores
                    CASE
                        WHEN v_vendedor.id_maleta IS NOT NULL THEN v_vendedor.id_usuario
                        WHEN random() < 0.6 THEN v_vendedor.id_usuario
                        ELSE (SELECT id FROM usuario WHERE user_name = 'joao.santos')
                    END,
                    v_tipo_pagamento,
                    v_parcelas,
                    CASE WHEN random() < 0.08 THEN (ARRAY['Presente de aniversário', 'Embrulhar para presente', 'Cliente pediu troca de tamanho se necessário'])[1 + (random() * 2)::int] END,
                    v_data_venda,
                    v_data_venda
                )
                RETURNING id INTO v_id_venda;

                -- Itens: 1 a 4 produtos diferentes do estoque do vendedor
                v_p := random();
                v_qtd_itens := CASE WHEN v_p < 0.5 THEN 1 WHEN v_p < 0.8 THEN 2 WHEN v_p < 0.95 THEN 3 ELSE 4 END;
                v_usados := ARRAY[]::int[];
                v_total := 0;

                FOR j IN 1..v_qtd_itens LOOP
                    SELECT e.id, e.quantidade, p.preco_compra, p.preco_venda_sugerido
                    INTO v_item
                    FROM estoque e
                    JOIN tmp_produto t ON t.id = e.id_produto
                    JOIN produto p ON p.id = e.id_produto
                    WHERE e.id_maleta IS NOT DISTINCT FROM v_vendedor.id_maleta
                    AND e.quantidade > 0
                    AND t.peso > 0
                    AND v_dia BETWEEN t.inicio AND t.fim
                    AND e.id <> ALL (v_usados)
                    ORDER BY -LN(1 - random()) / t.peso
                    LIMIT 1;

                    EXIT WHEN NOT FOUND;

                    v_qtd := LEAST(v_item.quantidade, CASE WHEN random() < 0.85 THEN 1 ELSE 2 END);
                    -- Loja vende com até 10% de desconto; revendedora vende acima do sugerido (repasse)
                    v_preco := CASE
                        WHEN v_vendedor.id_maleta IS NULL THEN ROUND(v_item.preco_venda_sugerido * (1 - (ARRAY[0, 0, 0, 0.05, 0.10])[1 + (random() * 4)::int]), 2)
                        ELSE CEIL(v_item.preco_venda_sugerido * (1.10 + random() * 0.20)) - 0.10
                    END;

                    INSERT INTO item_venda (id_venda, id_estoque, quantidade, preco_venda_real, preco_compra, preco_venda_sugerido)
                    VALUES (v_id_venda, v_item.id, v_qtd, v_preco, v_item.preco_compra, v_item.preco_venda_sugerido);

                    UPDATE estoque SET quantidade = quantidade - v_qtd, data_atualizacao = v_data_venda WHERE id = v_item.id;

                    v_usados := v_usados || v_item.id;
                    v_total := v_total + v_preco * v_qtd;
                END LOOP;

                -- Sem estoque para nenhum item: desfaz a venda
                IF v_total = 0 THEN
                    DELETE FROM venda WHERE id = v_id_venda;
                    CONTINUE;
                END IF;

                v_cancelada := random() < 0.03;

                -- Parcelas: à vista vence no dia; cartão de crédito vence mês a mês
                v_valor_parcela := ROUND(v_total / v_parcelas, 2);
                FOR j IN 1..v_parcelas LOOP
                    v_vencimento := CASE WHEN v_parcelas = 1 AND v_tipo_pagamento <> 3 THEN v_data_venda ELSE v_data_venda + j * INTERVAL '1 month' END;

                    INSERT INTO parcela (id_venda, numero_parcela, valor, data_vencimento)
                    VALUES (
                        v_id_venda,
                        j,
                        CASE WHEN j = v_parcelas THEN v_total - v_valor_parcela * (v_parcelas - 1) ELSE v_valor_parcela END,
                        v_vencimento
                    )
                    RETURNING id INTO v_id_parcela;

                    -- Recebimento: parcelas vencidas quase sempre pagas, com alguns dias de atraso
                    v_p := CASE WHEN v_vendedor.id_maleta IS NULL THEN 0.98 ELSE 0.92 END;
                    IF NOT v_cancelada AND v_vencimento <= v_limite_recebimento AND random() < v_p THEN
                        INSERT INTO recebimento_parcela (id_parcela, valor_recebido, data_recebimento)
                        SELECT
                            v_id_parcela,
                            pa.valor,
                            LEAST(v_vencimento + (random() * 5)::int * INTERVAL '1 day', v_limite_recebimento)
                        FROM parcela pa
                        WHERE pa.id = v_id_parcela;
                    END IF;
                END LOOP;

                -- Cancelamento: itens voltam para o estoque de origem
                IF v_cancelada THEN
                    INSERT INTO cancelamento_venda (id_venda, id_motivo_cancelamento_venda, data_cancelamento)
                    VALUES (v_id_venda, CASE WHEN random() < 0.7 THEN 1 ELSE 2 END, v_data_venda + INTERVAL '2 hours');

                    UPDATE estoque e
                    SET quantidade = e.quantidade + iv.quantidade
                    FROM item_venda iv
                    WHERE iv.id_venda = v_id_venda
                    AND iv.id_estoque = e.id;

                    UPDATE venda SET data_atualizacao = v_data_venda + INTERVAL '2 hours' WHERE id = v_id_venda;
                END IF;
            END LOOP;
        END LOOP;
    END LOOP;
END $$;

COMMIT;

-- ============================================================
-- VERIFICAÇÃO
-- ============================================================
-- SELECT 'usuario' AS tabela, COUNT(*) FROM usuario
-- UNION ALL SELECT 'cliente', COUNT(*) FROM cliente
-- UNION ALL SELECT 'produto', COUNT(*) FROM produto
-- UNION ALL SELECT 'maleta', COUNT(*) FROM maleta
-- UNION ALL SELECT 'estoque', COUNT(*) FROM estoque
-- UNION ALL SELECT 'venda', COUNT(*) FROM venda
-- UNION ALL SELECT 'item_venda', COUNT(*) FROM item_venda
-- UNION ALL SELECT 'parcela', COUNT(*) FROM parcela
-- UNION ALL SELECT 'recebimento_parcela', COUNT(*) FROM recebimento_parcela
-- UNION ALL SELECT 'cancelamento_venda', COUNT(*) FROM cancelamento_venda;
--
-- Faturamento por mês (sem canceladas):
-- SELECT DATE_TRUNC('month', v.data_venda) AS mes, COUNT(DISTINCT v.id) AS vendas,
--        SUM(iv.preco_venda_real * iv.quantidade) AS faturamento
-- FROM venda v
-- JOIN item_venda iv ON iv.id_venda = v.id
-- WHERE NOT EXISTS (SELECT 1 FROM cancelamento_venda c WHERE c.id_venda = v.id)
-- GROUP BY 1 ORDER BY 1;
